// pages/api/orders/index.ts

import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getOrders(req, res, session.user.id);
      break;
    case 'POST':
      await addOrder(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getOrders(req: NextApiRequest, res: NextApiResponse, userId: string) {
    try {
      const [orders] = await db.query("SELECT * FROM orders WHERE user_id = ?", [userId]);
      for (const order of orders) {
        const [items] = await db.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
        order.items = items || [];
      }
      res.status(200).json(orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

async function addOrder(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { clientId, items, status } = req.body;
  if (!clientId || !items || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [orderResult] = await db.query(
      "INSERT INTO orders (client_id, status, user_id) VALUES (?, ?, ?)",
      [clientId, status, userId]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await db.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    res.status(201).json({ id: orderId });
  } catch (err) {
    console.error('Failed to add order:', err);
    res.status(500).json({ error: 'Failed to add order' });
  }
}
