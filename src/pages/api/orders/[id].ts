import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { RowDataPacket, OkPacket } from 'mysql2'; // Импортируем типы для работы с базой данных

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      await getOrder(req, res, session.user.id, id as string);
      break;
    case 'PUT':
      if (req.headers.action=="status_update") {
        await updateOrderStatus(req, res, session.user.id, id as string);
      } else {
        await updateOrder(req, res, session.user.id, id as string);
      }
      break;
    case 'DELETE':
      await deleteOrder(req, res, session.user.id, id as string);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  try {
    const [orders] = await db.query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [orderItems] = await db.query<RowDataPacket[]>("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
    res.status(200).json({ ...orders[0], items: orderItems || [] });
  } catch (err: any) {
    console.error('Failed to fetch order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function updateOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  const { status, items } = req.body;

  if (!status || !items) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Обновляем статус заказа
    await connection.query<OkPacket>("UPDATE orders SET status = ? WHERE id = ? AND user_id = ?", [status, orderId, userId]);

    // Удаляем старые записи в order_items для этого заказа
    await connection.query<OkPacket>("DELETE FROM order_items WHERE order_id = ?", [orderId]);

    // Добавляем новые записи в order_items
    const insertItemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES ?
    `;
    const insertItemsData = items.map((item: any) => [orderId, item.product_id, item.quantity, item.price]);
    await connection.query<OkPacket>(insertItemsQuery, [insertItemsData]);

    await connection.commit();

    res.status(200).json({ message: 'Order updated successfully' });
  } catch (err: any) {
    await connection.rollback(); // Откатываем изменения в случае ошибки
    console.error('Failed to update order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  } finally {
    connection.release();
  }
}

async function updateOrderStatus(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Missing required field: status' });
  }

  try {
    await db.query<OkPacket>("UPDATE orders SET status = ? WHERE id = ? AND user_id = ?", [status, orderId, userId]);

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (err: any) {
    console.error('Failed to update order status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

async function deleteOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query<OkPacket>("DELETE FROM order_items WHERE order_id = ?", [orderId]);
    await connection.query<OkPacket>("DELETE FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
    await connection.commit();

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err: any) {
    await connection.rollback(); // Откатываем изменения в случае ошибки
    console.error('Failed to delete order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  } finally {
    connection.release();
  }
}
