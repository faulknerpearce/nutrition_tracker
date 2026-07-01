import { goals } from './goals.js'

export type NetBalanceStatus = 'under' | 'in_range' | 'over'

export interface NetBalance {
  consumed: number
  bmr: number
  activityCalories: number
  burned: number
  net: number
  goalLow: number
  goalHigh: number
  status: NetBalanceStatus
  remainingToLow: number
  overHighBy: number
  contextMessage: string
}

export function computeNetBalance(
  consumed: number,
  activityCalories: number,
  goalLow: number = goals.calories.low,
  goalHigh: number = goals.calories.high,
  bmr: number = 0,
): NetBalance {
  const burned = bmr + activityCalories
  const net = consumed - burned
  let status: NetBalanceStatus = 'in_range'
  if (net < goalLow) status = 'under'
  else if (net > goalHigh) status = 'over'

  const remainingToLow = Math.max(goalLow - net, 0)
  const overHighBy = Math.max(net - goalHigh, 0)

  let contextMessage: string
  if (status === 'under') {
    contextMessage = `${remainingToLow.toLocaleString()} kcal remaining to hit ${goalLow.toLocaleString()} kcal low target`
  } else if (status === 'over') {
    contextMessage = `${overHighBy.toLocaleString()} kcal over ${goalHigh.toLocaleString()} kcal high target`
  } else {
    contextMessage = `Within ${goalLow.toLocaleString()}–${goalHigh.toLocaleString()} kcal target range`
  }

  return {
    consumed,
    bmr,
    activityCalories,
    burned,
    net,
    goalLow,
    goalHigh,
    status,
    remainingToLow,
    overHighBy,
    contextMessage,
  }
}