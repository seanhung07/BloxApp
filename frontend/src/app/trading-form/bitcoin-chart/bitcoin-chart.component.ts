import { Component, AfterViewInit, Renderer2, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-bitcoin-chart',
  templateUrl: './bitcoin-chart.component.html',
  styleUrls: ['./bitcoin-chart.component.css']
})
export class BitcoinChartComponent implements AfterViewInit {

  @ViewChild('tradingview') tradingview?: ElementRef;
  constructor(private _renderer2: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit(): void {
    let script = this._renderer2.createElement('script');
    script.type = `text/javascript`;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.text = `
    {
      "width": "100%",
      "height": 400,
      "defaultColumn": "overview",
      "screener_type": "crypto_mkt",
      "displayCurrency": "USD",
      "colorTheme": "light",
      "locale": "en"
    }`;
  
    this.tradingview?.nativeElement.appendChild(script);
  }

}