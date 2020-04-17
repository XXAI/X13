import { Observable, Subject } from 'rxjs';

export class ReportWorker {

  private readonly worker: Worker;
  private onMessage = new Subject<MessageEvent>();
  private onError = new Subject<ErrorEvent>();

  constructor() {

    const WORKER_ENABLED = !!(Worker);

    if (WORKER_ENABLED) {
      this.worker = new Worker(('./reportes/reporte-pdf.worker'), { type: 'module' });

      this.worker.onmessage = (data) => {
        this.onMessage.next(data);
      };

      this.worker.onerror = (data) => {
        this.onError.next(data);
      };

    } else {
      throw new Error('WebWorker is not enabled');
    }
  }

  postMessage(data) {
    this.worker.postMessage(data);
  }

  onmessage(): Observable<MessageEvent> {
    return this.onMessage.asObservable();
  }

  onerror(): Observable<ErrorEvent> {
    return this.onError.asObservable();
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}