#!/usr/bin/node

/** FUNCS AND CONSTS */

const HEAD = 
`# File Name: E:\TEST
# Comment: THIS IS A TEST FILE
# Operator: APOSPHERE
# Barcode: 
# Instrument Type: QuantStudio™ 7 Pro System
# Block Type: 384-Well Block
# Instrument Name: QS7Pro-2778721020086
# Instrument Serial Number: 2778721020086
# Heated Cover Serial Number: 2779321030934
# Block Serial Number: 2778321030941
# Run Start Date/Time: 2021-08-14 06:05:00 PM CEST
# Run End Date/Time: 2021-08-14 07:08:30 PM CEST
# Run Duration: 63 minutes 30 seconds
# Sample Volume: 20.0
# Cover Temperature: 105.0
# Passive Reference: ROX
# PCR Stage/Step Number: Stage 2 Step 2
# Quantification Cycle Method: CT
# Analysis Date/Time: 2021-09-28 10:09:43 AM CEST
# Software Name and Version: Design & Analysis Software v2.5.1
# Plugin Name and Version: Primary Analysis v1.6.0, Relative Quantification v1.4.1
# Exported On: 2021-09-28 10:09:51 AM CEST
"Well","Well Position","Omit","Sample","Target","Task","Reporter","Quencher","Cq","Cq Mean","Amp Status","Amp Score","Curve Quality","Result Quality Issues","Cq Confidence","Cq SD","Auto Threshold","Threshold","Auto Baseline","Baseline Start","Baseline End"`

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const M = 16
const N = 24
const NEG_CONTROL_COORDINATE = "C24"
const POS_CONTROL_COORDINATE = "P24"
const SEED = 1234
const RESULT_WEIGHTS = { negative: 20, positive: 3, undetermined: 1 }

const i2c = (i) => ALPHABET[Math.floor((i-1) / N)] + ((i-1) % N + 1)

const r2cq = (r) =>
{
  switch (r)
  {
    case "negative": return [0, "Undetermined", 34]
    case "positive": return ["", 39, ""]
    case "undetermined": return ["", "Undetermined", 36]
    default: return ["", "", ""]
  }
}

function xmur3(str) 
{
  for(var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 3432918353), h = h << 13 | h >>> 19;

  return function() 
  {
    h = Math.imul(h ^ h >>> 16, 2246822507)
    h = Math.imul(h ^ h >>> 13, 3266489909)
    return (h ^= h >>> 16) >>> 0
  }
}

const generateEntry = (i, c, cq) => 
`
"${i}","${c}",,,"RNA IC",,,,"${cq[0]}"
"${i}","${c}",,,"N1N2",,,,"${cq[1]}"
"${i}","${c}",,,"Human IC",,,,${cq[2]}"`


/** ALGO */

let F = HEAD
const nextResult = xmur3(SEED)
let count = { negative: 0, positive: 0, undetermined: 0, unknown: 0 }

for (let i = 1; i<=384; i++)
{
  const v = nextResult() % (RESULT_WEIGHTS["negative"] + RESULT_WEIGHTS["positive"] + RESULT_WEIGHTS["undetermined"])
  let r = "unknown"
  if (v < RESULT_WEIGHTS["negative"]) r = "negative"
  else if (v < RESULT_WEIGHTS["negative"] + RESULT_WEIGHTS["positive"]) r = "positive"
  else r = "undetermined"

  if (i2c(i) === NEG_CONTROL_COORDINATE) 
  {
    count["negative"]++
    F += generateEntry(i, i2c(i), r2cq("negative"))
  }
  else if (i2c(i) === POS_CONTROL_COORDINATE) 
  {
    count["positive"]++
    F += generateEntry(i, i2c(i), r2cq("positive"))
  }
  else 
  {
    count[r]++
    F += generateEntry(i, i2c(i), r2cq(r))
  }
}

console.log(F)