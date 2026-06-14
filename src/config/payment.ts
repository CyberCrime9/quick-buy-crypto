import btcQr from "@/assets/btc-qr.jpg.asset.json";
import ethQr from "@/assets/eth-qr.jpg.asset.json";
import usdtQr from "@/assets/usdt-qr.jpg.asset.json";

export const PAYMENT_CONFIG = {
  btcAddress: "bc1qfvwydq4q8hjj4kk58s0gfddcy5n77phznan899",
  ethAddress: "0xc405541C3A706736A1c2e0b2284ab5449AFb8e0b",
  usdtAddress: "THeCWFmQZNn83YW74R9VGpeRMRdysWdLcj",
  contactEmail: "payments@vintagewineshop.com",
  shopName: "Vintage Wine Bottles",
};

export type PaymentMethod = "btc" | "eth" | "usdt";

export const PAYMENT_METHODS: Record<PaymentMethod, {
  id: PaymentMethod;
  name: string;
  ticker: string;
  network: string;
  address: string;
  qr: string;
  decimals: number;
  coingeckoId: string;
  color: string;
  symbol: string;
}> = {
  btc: {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    network: "Bitcoin",
    address: "bc1qfvwydq4q8hjj4kk58s0gfddcy5n77phznan899",
    qr: btcQr.url,
    decimals: 8,
    coingeckoId: "bitcoin",
    color: "#f7931a",
    symbol: "₿",
  },
  eth: {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    network: "Ethereum",
    address: "0xc405541C3A706736A1c2e0b2284ab5449AFb8e0b",
    qr: ethQr.url,
    decimals: 6,
    coingeckoId: "ethereum",
    color: "#627eea",
    symbol: "Ξ",
  },
  usdt: {
    id: "usdt",
    name: "Tether",
    ticker: "USDT",
    network: "TRC20",
    address: "THeCWFmQZNn83YW74R9VGpeRMRdysWdLcj",
    qr: usdtQr.url,
    decimals: 2,
    coingeckoId: "tether",
    color: "#26a17b",
    symbol: "₮",
  },
};
