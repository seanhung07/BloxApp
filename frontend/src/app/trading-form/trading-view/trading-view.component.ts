import { Component, AfterViewInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-trading-view',
  templateUrl: './trading-view.component.html',
  styleUrls: ['./trading-view.component.css']
})
export class TradingViewComponent implements AfterViewInit {
  @ViewChild('tradingview') tradingview?: ElementRef;

  currency = new FormControl('');

  constructor(private _renderer2: Renderer2) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //creates script to load in widget
    let widget = this._renderer2.createElement('script');
    widget.type = `text/javascript`;
    widget.text = `
      new TradingView.widget(
        {
          "autosize": true,
          "symbol": "BTCUSD",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingViewWidget"
        });
    `
    this.tradingview?.nativeElement.appendChild(widget);
  }

  onSubmitTrade(){

    this._renderer2.setProperty(this.tradingview?.nativeElement, 'innerHTML', '');


    //creates script to load in widget
    let widget = this._renderer2.createElement('script');
    widget.type = `text/javascript`;
    widget.text = `
      new TradingView.widget(
        {
          "autosize": true,
          "symbol": "`+ this.currency.value + `USD",
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "light",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingViewWidget"
        });
    `

    this.tradingview?.nativeElement.appendChild(widget);
  }

}
