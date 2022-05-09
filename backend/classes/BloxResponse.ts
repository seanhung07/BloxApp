class BloxResponse {
  data: any;
  error?: string
  constructor(data: any, error?: string) {
    this.data  = data;
    this.error = error;
  }
}

export default BloxResponse;
