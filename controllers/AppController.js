import DBClient from '../utils/db';
import Redis from '../utils/redis';

class AppController {
  static getStatus(req, res) {
    res.status(200).send({
      redis: Redis.isAlive(),
      db: DBClient.isAlive(),
    });
  }

  static async getStats(req, res) {
    const nusr = await DBClient.nbUsers();
    const nfils = await DBClient.nbFiles();
    res.status(200).send({
      users: nusr,
      files: nfils,
    });
  }
}

export default AppController;
