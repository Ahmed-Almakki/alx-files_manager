import { createHash } from 'crypto';
import DBClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).send({ error: 'Missing password' });
    }
    if (email) {
      const response = await DBClient.client.db().collection('users').findOne({ email });
      if (response) {
        return res.status(400).send({ error: 'Already exist' });
      }
      const shap = createHash('sha1');
      const hasPass = shap.update(password).digest('hex');
      const doc = {
        email,
        password: hasPass,
      };
      const result = await DBClient.client.db().collection('users').insertOne(doc);
      return res.status(201).send({ id: result.insertedId, email });
    }
    return 0;
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const kkey = `auth_${token}`;
    const result = await redisClient.get(kkey);
    console.log(result);
    if (result) {
      const data = JSON.parse(result);
      console.log(data);
      return res.send({ id: data.id, email: data.email });
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }
}

export default UsersController;
