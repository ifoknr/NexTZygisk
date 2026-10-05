import { whichCurrentPage } from '../navbar.js'
import { getStrings } from '../pageLoader.js'
import utils from '../utils.js'
import { toast } from '../../kernelsu.js'
import { icon } from '../../icons.js'
import { runTool, toolsHTML } from '../../tools.js'
import {
  MONITOR_STATE,
  confirmDialog,
  getPtracer,
  getState,
  haptic,
  isUmountDisabled,
  monitorControl,
  run,
  setUmountDisabled,
  startPolling,
  summarizeState
} from '../../rz.js'

let busy = false
let stopPolling = () => {}

/* INFO: Mini pages (e.g. logs) overlay this page, keep it alive under them. */
function isActive() {
  return /^(actions$|mini_actions_)/.test(whichCurrentPage() || '')
}

function renderMonitor(summary, strings) {
  const pill = document.getElementById('monitor_status')
  const text = document.getElementById('monitor_status_text')
  const reason = document.getElementById('monitor_reason')
  if (!pill || !text) return

  const map = {
    [MONITOR_STATE.TRACING]: [ strings.monitor.status.tracing, 'ok' ],
    [MONITOR_STATE.STOPPING]: [ strings.monitor.status.stopping, 'warn' ],
    [MONITOR_STATE.STOPPED]: [ strings.monitor.status.stopped, 'warn' ],
    [MONITOR_STATE.EXITING]: [ strings.monitor.status.exiting, 'err' ]
  }

  const [ label, tone ] = map[summary.monitor.state] || [ strings.monitor.status.unknown, 'muted' ]

  text.textContent = label
  pill.className = `nz_pill nz_pill_${tone}`
  pill.querySelector('.nz_dot').className = `nz_dot ${tone !== 'muted' ? `nz_dot_${tone}` : ''}`

  reason.textContent = summary.monitor.reason
    ? `${strings.monitor.reason}: ${summary.monitor.reason}`
    : strings.monitor.description

  const state = summary.monitor.state
  const exited = state === MONITOR_STATE.EXITING || state === null

  document.getElementById('monitor_start_button').disabled = busy || exited || state === MONITOR_STATE.TRACING
  document.getElementById('monitor_pause_button').disabled = busy || exited || state !== MONITOR_STATE.TRACING
  document.getElementById('monitor_stop_button').disabled = busy || exited
}

async function refresh() {
  const [ state, strings ] = await Promise.all([ getState(), getStrings('actions') ])
  if (!strings || !isActive()) return null

  const summary = summarizeState(state)
  renderMonitor(summary, strings)

  return summary
}

/* INFO: Sends a control command and waits (up to ~3s) for state.json to reflect it,
           instead of optimistically faking the new state. */
async function sendMonitorCommand(command, expected) {
  const strings = await getStrings('actions')

  busy = true
  await refresh()

  const result = await monitorControl(command)
  if (!result.ok) {
    toast(strings.monitor.failed)
  } else {
    for (let i = 0; i < 12; i++) {
      await new Promise((resolve) => setTimeout(resolve, 250))

      const summary = summarizeState(await getState())
      if (expected.includes(summary.monitor.state) || summary.monitor.state === null) break
    }
  }

  busy = false
  await refresh()
}

async function runDaemonInfo(strings) {
  const output = document.getElementById('daemon_output')
  output.classList.add('nz_mono')
  output.textContent = '…'

  const ptracer = await getPtracer()
  const binaries = [ ptracer ]
  if (ptracer.endsWith('64')) binaries.push(ptracer.replace(/64$/, '32'))

  const command = binaries.map((bin) =>
    `if [ -x "${bin}" ]; then echo "# ${bin.split('/').pop()}"; "${bin}" info 2>&1 | tail -n +3; echo; fi`
  ).join(' ; ')

  const result = await run(command)
  if (!isActive()) return

  output.textContent = result.stdout.trim() || strings.daemon.notRunning
}

async function renderUmount(strings) {
  const disabled = await isUmountDisabled()
  if (!isActive()) return

  const toggle = document.getElementById('umount_switch')
  const desc = document.getElementById('umount_desc')
  if (!toggle || !desc) return

  toggle.checked = !disabled
  desc.textContent = disabled ? strings.umount.off : strings.umount.on
  desc.style.color = disabled ? 'var(--warn)' : ''
}

export async function loadOnce() {

}

export async function loadOnceView() {
  await refresh()
}

export async function onceViewAfterUpdate() {
  await refresh()
}

export async function load() {
  const strings = await getStrings('actions')

  document.getElementById('monitor_icon').innerHTML = icon('speed')
  document.getElementById('monitor_start_icon').innerHTML = icon('play')
  document.getElementById('monitor_pause_icon').innerHTML = icon('pause')
  document.getElementById('monitor_stop_icon').innerHTML = icon('stop')

  document.getElementById('actions_tools').innerHTML = toolsHTML(strings)
  renderUmount(strings)

  utils.addListener(document.getElementById('umount_switch'), 'change', async (event) => {
    haptic()

    const toggle = event.target
    const enable = toggle.checked

    if (!enable) {
      /* INFO: Turning it off weakens hiding, make sure it is intended. */
      toggle.checked = true

      const ok = await confirmDialog({
        title: strings.umount.confirmTitle,
        message: strings.umount.confirmMessage,
        confirm: strings.umount.confirm,
        cancel: strings.cancel,
        danger: true
      })
      if (!ok) return

      toggle.checked = false
    }

    const result = await setUmountDisabled(!enable)
    if (!result.ok) {
      toast(strings.umount.failed)
      toggle.checked = !enable

      return
    }

    toast(strings.umount.reboot)
    renderUmount(strings)
  })

  utils.addListener(document.getElementById('monitor_start_button'), 'click', () => {
    haptic()
    sendMonitorCommand('start', [ MONITOR_STATE.TRACING ])
  })

  utils.addListener(document.getElementById('monitor_pause_button'), 'click', () => {
    haptic()
    sendMonitorCommand('stop', [ MONITOR_STATE.STOPPING, MONITOR_STATE.STOPPED ])
  })

  utils.addListener(document.getElementById('monitor_stop_button'), 'click', async () => {
    haptic()

    const ok = await confirmDialog({
      title: strings.monitor.confirmExit.title,
      message: strings.monitor.confirmExit.message,
      confirm: strings.monitor.button.stop,
      cancel: strings.cancel,
      danger: true
    })
    if (!ok) return

    sendMonitorCommand('exit', [ MONITOR_STATE.EXITING ])
  })

  utils.addListener(document.getElementById('daemon_run'), 'click', () => {
    haptic()
    runDaemonInfo(strings)
  })

  utils.addListener(document.getElementById('actions_tools'), 'click', (event) => {
    const tool = event.target.closest('[data-tool]')?.getAttribute('data-tool')
    if (tool) runTool(tool, strings)
  })

  await refresh()

  stopPolling()
  stopPolling = startPolling(() => (busy ? null : refresh()), isActive)
}
