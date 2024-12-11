import { createHash } from 'crypto';
import { ObjectId } from 'mongodb';
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

  static async getMe(request, response) {
    try {
      const userToken = request.header('X-Token');
      const authKey = `auth_${userToken}`;
      const userID = await redisClient.get(authKey);
      if (!userID) {
        response.status(401).json({ error: 'Unauthorized' });
      }
      const user = await DBClient.client.db()
        .collection('users')
        .findOne({ _id: ObjectId(userID) });
      response.json({ id: user._id, email: user.email });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;
