import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import DBClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authheader = req.headers.authorization;

    if (!authheader) {
      return res.status(401).send({ error: 'You aren\'t authenticated' });
    }

    const Auth = Buffer.from(authheader.split(' ')[1], 'base64')
      .toString().split(':');
    const email = Auth[0];
    const password = Auth[1];
    const haspass = createHash('sha1').update(password).digest('hex');
    const result = await DBClient.client.db()
      .collection('users')
      .findOne({ email, password: haspass });
    if (result.email === email && result.password === haspass) {
      const uid = uuidv4().toString();
      const KeyToken = `auth_${uid}`;
      redisClient.set(KeyToken, result.id, 86400);
      return res.status(200).send({ token: uid });
    }
    return res.status(401).send({ error: 'Unauthorized' });
  }

  static async getDisconnect(req, res) {
    const Xtok = req.headers['x-token'];
    if (!Xtok) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const Keytoken = `auth_${Xtok}`;
    const deleted = await redisClient.del(Keytoken);
    return res.status(204).send();
  }
}

export default AuthController;
