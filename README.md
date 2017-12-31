# 👈🏻 That Guy (AKA Steve Castle)

##### Genetic cryptocurrency trading bot

![](images/that-guy.jpg)

> Awesome. Awesome to the max.

#### 💰 Donations

* **BTC:** `1K7Uc9MDzokCGEsUxrQQXn59VQ1Q9AWGvZ`
* **BCH:** `1BHM8oACVN6F4xksXAAP3nR9EoAkfd8sGF`
* **ETH:** `0x8CcA7589d8061ad4D3D913412d1EAD71cbEae081`
* **LTC:** `LRJ4Evzmyynp8Uswiy7e2uWhPKBNiSHroq`

#### ⚠️ Disclaimer

You take full responsibility for actions of this bot. Any loss of money, getting banned from an exchange or blocked by ISP are on you.

**Please start with running against existing market data first** before you use it with a live exchange.

## 🏃 Running

Quickest way is to use Docker (first you need to [install it for your operating system](https://docs.docker.com/engine/installation/)):

```sh
$ docker run --rm suda/that-guy COMMAND
```

### `backfill`

Gets history data from the exchange for the specified pair and stores in `data/EXCHANGE/CURRENCY,CURRENCY/TIMESTAMP_FROM-TIMESTAMP_TO.csv` file.
```sh
$ docker run --rm -v ${PWD}:/data suda/that-guy \
  backfill <exchange> --days 7 <fsym> <tsym>
```

#### Options

##### `--days`

Number of days to back fill. **Default: 7**.

### `backtest`

Runs trading settings against backfilled market data.

```sh
$ docker run --rm -v ${PWD}:/data suda/that-guy \
  backtest <exchange> <fsym> <tsym>
```
Takes the same arguments as [Live Trading](#live-trading) except for exchange credentials.

Report will be printed on the `stdout` in a `key: value` format for easier parseability.

### `live`

Runs the current settings against live market. **This actually creates buy/sell orders**.
```sh
$ docker run --rm suda/that-guy \
  live <exchange> --api-key API_KEY --api-secret API_SECRET <fsym> <tsym>
```

#### Options

##### `<exchange>` *required*

Specify the id of exchange you want That Guy to trade on. You can see the full list using the **exchanges** command.

  * `-ak/--api-key`

  Exchange API key.

  * `-as/--api-secret`

  Exchange API secret.

  * `-u/--uid`

  Exchange UID.

  * `-l/--login`

  Exchange login.

  * `-p/--password`

  Exchange password.

##### `-sba/--start-balance-a` *required*

Start balance of the first currency/cryptocurrency pair.

##### `-sbb/--start-balance-b` *required*

Start balance of the second currency/cryptocurrency pair.

##### `<fsym>` *required*

From currency symbol.

##### `<tsym>` *required*

To currency symbol.

##### `--interval`

Specify how often pull market data. **Default: 15m**.

##### `-sl/--stop-loss`

Loss percentage at which to sell. **Default: 50**.

##### `-tp/--take-profit`

Profit percentage at which to sell. **Default: 50**.

##### `-ef/--exchange-fees`

Percentage of exchange fees. **Default: 0.25**.

#### Specifying indicators

* CLI: `--adl --adx-period=14 --bb-period=20 --bb-stddev=2` (passing indicator arguments enables it by default)
* Environment variables:
```
THAT_GUY_INDICATORS_ADL
THAT_GUY_INDICATORS_ADX_PERIOD=14
THAT_GUY_INDICATORS_BB_PERIOD=20
THAT_GUY_INDICATORS_BB_STDDEV=2
```
* YAML:
```yml
indicators:
  - adl:
  - adx:
    period=14
  - bb:
    period=20
    stddev=2
```

[List of available indicators](https://github.com/anandanand84/technicalindicators#available-indicators).

### `exchanges`

Lists all supported exchanges.

### `pairs <exchange>`

List pairs supported by exchange.

### Passing options

All options can be specified in one of the three ways:

* CLI arguments as described above
* Environment variables. Name of the variable will be uppercased, separated with underscores and prefixed with `THAT_GUY`, i.e. `--exchange-fees` will be `THAT_GUY_EXCHANGE_FEES`
* YAML file passed with `-c/--config` CLI argument

When specifying the YAML file, it must be accessible inside the Docker container. Either by building a custom image based on this one or by mounting it with `-v` Docker flag.

### 🤔 Available indicators

List of all available indicators (name, shorthand and default values of arguments):

* [Accumulation Distribution Line (ADL)](https://tonicdev.com/anandaravindan/adl)
* [Average Directional Index (ADX)](https://github.com/anandanand84/technicalindicators/blob/master/test/directionalmovement/ADX.js)
  * `period=14`
* [Average True Range (ATR)](https://tonicdev.com/anandaravindan/atr)
  * `period=14`
* [Bollinger Bands (BB)](https://tonicdev.com/anandaravindan/bb)
  * `period=20`
  * `stddev=2`
* [Commodity Channel Index (CCI)](https://github.com/anandanand84/technicalindicators/blob/master/test/oscillators/CCI.js)
  * `period=14`
* [Force Index (FI)](https://github.com/anandanand84/technicalindicators/blob/master/test/volume/ForceIndex.js)
  * `period=14`
* [Know Sure Thing (KST)](https://tonicdev.com/anandaravindan/kst)
  * `period=14`
  * `rocper1=10`
  * `rocper2=15`
  * `rocper3=20`
  * `rocper4=30`
  * `smrocper1=10`
  * `smrocper2=10`
  * `smrocper3=10`
  * `smrocper4=15`
* [Moving Average Convergence Divergence (MACD)](https://tonicdev.com/anandaravindan/macd)
  * `fast-period=12`
  * `slow-period=26`
  * `signal-period=9`
* [On Balance Volume (OBV)](https://tonicdev.com/anandaravindan/obv)
* [Parabolic Stop and Reverse (PSAR)](https://github.com/anandanand84/technicalindicators/blob/master/test/momentum/PSAR.js)
  * `steps=0.02`
  * `max=0.2`
* [Rate of Change (ROC)](https://tonicdev.com/anandaravindan/roc)
  * `period=14`
* [Relative Strength Index (RSI)](https://tonicdev.com/anandaravindan/rsi)
  * `period=14`
* [Simple Moving Average (SMA)](https://tonicdev.com/anandaravindan/sma)
  * `short-period=3`
  * `long-period=14`
* [Stochastic Oscillator (KD)](https://tonicdev.com/anandaravindan/stochastic)
  * `period=14`
  * `signal-period=14`
* [Triple Exponentially Smoothed Average (TRIX)](https://tonicdev.com/anandaravindan/trix)
  * `period=14`
* [Volume Weighted Average Price (VWAP)](https://github.com/anandanand84/technicalindicators/blob/master/test/volume/VWAP.js)
* [Exponential Moving Average (EMA)](https://tonicdev.com/anandaravindan/ema)
  * `short-period=3`
  * `long-period=14`
* [Weighted Moving Average (WMA)](https://tonicdev.com/anandaravindan/wma)
  * `period=14`
* [Wilder’s Smoothing (Smoothed Moving Average, WEMA)](https://tonicdev.com/anandaravindan/wema)
  * `period=14`
* [WilliamsR (WPR AKA W%R)](https://tonicdev.com/anandaravindan/williamsr)
  * `period=14`

### 👨‍👩‍👧‍👦 Evolving the genetic algorithm

The process of genetic algorithm works as follows:

1. Create a handful of random set of indicators to use
1. Run That Guy against an archived market data (from the same exchange and currency pair it's intended to be use later)
1. Comparing results of the sets and picking the winner
  * if That Guy exits with non-zero code ignore this set (it's probably invalid/out of bounds)
  * the highest return the bigger change of survival
1. Introduce mutation
  * from the winners, create another set by randomly changing few arguments
  * add some cross breeding by copying parts of winners with other winners?
1. If the number of generations is high enough stop and save the config.
1. `GOTO 2`

#### 📊 Generation statistics

For every generation/set pair, config file is created at `reports/:generation/:set_id.yml` as well a summary file in `reports/:generation/summary.csv`. Those summaries can be used to visualize how different indicators and their arguments were being used. Useful statistics to pull out of them:

* Return per generation
* Used indicators per generation
* Original strain/family?

## 📜 License

This bot is licensed on GNU GPLv3.

## 🙇 Thanks

* `ccxt` team for creating this amazing library
* `anandanand84` and contributors for comprehensive technical indicators library
* `autonio` for building the first usable GUI allowing to create crypto algos and some sensible defaults
