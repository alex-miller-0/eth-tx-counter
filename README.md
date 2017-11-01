# eth-tx-counter

Given an address and a boundary of block numbers, look up the number of transactions made to that address. Optionally, you may include data to ensure data sent to your address matches what you're looking for.

Example:

```
node index.js --address=0x94dc1cf66c8fd62ef3bd7da53f47423862839823 --start_block=4472532 --end_block=4472534 --data 0x3290ce29
```

You may also search based on start and end timestamps. All timestamps are UNIX-formatted and in GMT. Note that this option is very slow and has to scan the entire blockchain in reverse until it finds appropriate anchor points (start and end blocks).

Example with timestamps:

```
node index.js --address=0x94dc1cf66c8fd62ef3bd7da53f47423862839823 --start=1509578094 --end=1509578261 --data 0x3290ce29
```
