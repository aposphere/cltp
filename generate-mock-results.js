#!/usr/bin/node

/** FUNCS AND CONSTS */

/** The pcr plate id */
const PCR_ID = 'pcr1'

/** The header result details of the result csv */
const HEAD =
`# File Name: E:\TEST
# Comment: THIS IS A TEST FILE
# Operator: APOSPHERE
# Barcode: ${ PCR_ID }
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

/** Alphabet */
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
/** Height of the plate */
const M = 16
/** Width of the plate */
const N = 24
/** Coordinate of the negative control */
const NEG_CONTROL_COORDINATE = "C24"
/** Coordinate of the positive control */
const POS_CONTROL_COORDINATE = "P24"
/** The seed of the random function */
const SEED = 1234
/** The weights of the different results */
const RESULT_WEIGHTS = { negative: 20, positive: 3, undetermined: 1 }

/** Convert index to char */
const i2c = (i) => ALPHABET[Math.floor((i-1) / N)] + ((i-1) % N + 1)

/** Convert result to cq values */
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

/** Rand alg */
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

/** Generate the rows for a result entry */
const generateEntry = (i, c, cq) =>
`
"${i}","${c}",,,"RNA IC",,,,"${cq[0]}"
"${i}","${c}",,,"N1N2",,,,"${cq[1]}"
"${i}","${c}",,,"Human IC",,,,"${cq[2]}"`


/** ALGO */

/** The file content */
let F = HEAD

/** Rand alg iterator */
const nextResult = xmur3(SEED)

/** Count all results  */
let count = { negative: 0, positive: 0, undetermined: 0, unknown: 0 }

// Loop all entries
for (let i = 1; i<=384; i++)
{
  // Map the rand val into the range of the weights
  const v = nextResult() % (RESULT_WEIGHTS["negative"] + RESULT_WEIGHTS["positive"] + RESULT_WEIGHTS["undetermined"])

  // The result
  let r

  // Decide the result based on the weights
  if (v < RESULT_WEIGHTS["negative"] - 1) r = "negative"
  else if (v < RESULT_WEIGHTS["negative"] + RESULT_WEIGHTS["positive"] - 1) r = "positive"
  else r = "undetermined"

  // Hard-code the neg control
  if (i2c(i) === NEG_CONTROL_COORDINATE)
  {
    count["negative"]++
    F += generateEntry(i, i2c(i), r2cq("negative"))
  }
  // Hard-code the pos control
  else if (i2c(i) === POS_CONTROL_COORDINATE)
  {
    count["positive"]++
    F += generateEntry(i, i2c(i), r2cq("positive"))
  }
  // Generate the entry for the result
  else
  {
    count[r]++
    F += generateEntry(i, i2c(i), r2cq(r))
  }
}

// Print the file to stdout
console.log(F)
