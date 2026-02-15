import { createPublicClient, http } from "viem"

export const tempoChain = {
  id: 42431,
  name: "Tempo Testnet",
  nativeCurrency: {
    name: "USD",
    symbol: "USD",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.moderato.tempo.xyz"],
    },
  },
}

export const tempoPublicClient = createPublicClient({
  chain: tempoChain,
  transport: http("https://rpc.moderato.tempo.xyz"),
})
