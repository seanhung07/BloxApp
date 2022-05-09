
class BloxDbClosedError extends Error {

  constructor() {
    super("Attempted to query the database while the database is currently closed.");
  }
}

export default BloxDbClosedError;
