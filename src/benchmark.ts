import { PrismaClient } from '@prisma/client'
import { min, max, mean, median } from 'simple-statistics'

const db = new PrismaClient()

const loadData = async (): Promise<number> => {
  const hrstart = process.hrtime()
  try {
    await db.user.findMany()
  } catch (e) {
    return NaN
  }
  const hrend = process.hrtime(hrstart)
  return hrend[1] / 1000000
}

const main = async () => {
  const [, , ...ns] = process.argv
  for (const n of ns) {
    const connections = Number(n)
    console.log('\nConnection:\t', connections)
    const samples = await Promise.all([...Array(connections)].map(loadData))

    const succeeds = samples.filter((n) => n > 0)
    const failed = samples.filter((n) => !(n > 0))
    console.log('Succeed / Timeout:\t', succeeds.length, '/', failed.length)
    console.log('Performance (ms)')
    console.log('\tMin:\t', min(succeeds).toFixed(2))
    console.log('\tMax:\t', max(succeeds).toFixed(2))
    console.log('\tMean:\t', mean(succeeds).toFixed(2))
    console.log('\tMedian:\t', median(succeeds).toFixed(2))
  }
}

main()