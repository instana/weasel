// @flow

export type Event = {
  initialize: () => mixed,
  name: string,
  time: ?number
}

export type State = {
  onEnter: () => mixed
}

export type BeaconData = {
  [key: string]: ?number|?string
}
