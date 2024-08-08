// pages/api/orders/[id].ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      await getOrder(req, res, session.user.id, id);
      break;
    case 'PUT':
      await updateOrder(req, res, session.user.id, id);
      break;
    case 'DELETE':
      await deleteOrder(req, res, session.user.id, id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
    try {
      const [orders] = await db.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      const [orderItems] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
      res.status(200).json({ ...orders[0], items: orderItems || [] });
    } catch (err) {
      console.error('Failed to fetch order:', err);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
  

  async function updateOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
      await db.query("UPDATE orders SET status = ? WHERE id = ? AND user_id = ?", [status, orderId, userId]);
      res.status(200).json({ message: 'Order updated successfully' });
    } catch (err) {
      console.error('Failed to update order:', err);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
  

async function deleteOrder(req: NextApiRequest, res: NextApiResponse, userId: string, orderId: string) {
  try {
    await db.query("DELETE FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
    await db.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Failed to delete order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}
