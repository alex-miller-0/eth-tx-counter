# eth-tx-counter

Given an address and a boundary of block numbers, look up the number of transactions made to that address. Optionally, you may include data to ensure data sent to your address matches what you're looking for.

Example:

```
node index.js --address=0x94dc1cf66c8fd62ef3bd7da53f47423862839823 --start=4472532 --end=4472534 --data 0x3290ce29
```
