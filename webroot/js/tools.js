/* INFO: Tools shared by the Actions page and the Home quick tools (wide screens). */

import { loadPage } from './pages/pageLoader.js'
import { whichCurrentPage } from './pages/navbar.js'
import { toast } from './kernelsu.js'
import { icon } from './icons.js'
import {
  LOG_TAGS,
  MODDIR,
  STATE_DIR,
  STATE_FILE,
  confirmDialog,
  copyText,
  escapeHTML,
  getPtracer,
  haptic,
  run
} from './rz.js'

const TOOLS = [
  { id: 'logs', iconName: 'logs' },
  { id: 'export', iconName: 'download' },
  { id: 'copyState', iconName: 'copy' },
  { id: 'restart', iconName: 'restart', danger: true },
  { id: 'reboot', iconName: 'power', danger: true }
]

/* INFO: `strings` are the Actions page strings. */
export function toolsHTML(strings, only = null) {
  return TOOLS
    .filter((tool) => !only || only.includes(tool.id))
    .map((tool, i) => `
      <button class="nz_action ${tool.danger ? 'nz_action_danger' : ''}" data-tool="${tool.id}" style="animation-delay: ${i * 40}ms;">
        <div class="nz_action_icon">${icon(tool.iconName)}</div>
        <div>
          <div class="nz_action_title">${escapeHTML(strings.tools[tool.id].title)}</div>
          <div class="nz_action_desc">${escapeHTML(strings.tools[tool.id].desc)}</div>
        </div>
      </button>
    `).join('')
}

export async function exportDiagnostics(strings) {
  const ptracer = await getPtracer()
  const script = [
    'D=/sdcard/Download/NextZygisk',
    'mkdir -p "$D"',
    'F="$D/nextzygisk-diagnostics-$(date +%Y%m%d-%H%M%S).txt"',
    '{',
    'echo "===== NextZygisk diagnostics ====="; date; echo',
    `echo "===== module.prop ====="; cat ${MODDIR}/module.prop; echo`,
    `echo "===== state.json ====="; cat ${STATE_FILE}; echo`,
    'echo "===== device ====="; uname -a; echo "SELinux: $(getenforce)"',
    "getprop | grep -E 'ro\\.build\\.(version|fingerprint|type|tags)|ro\\.product\\.(model|brand|device|cpu)|ro\\.zygote|security_patch'",
    'echo; echo "===== processes ====="; ps -A -o PID,PPID,USER,NAME 2>/dev/null | grep -E "zygisk|zygote|PID"',
    'echo; echo "===== modules ====="; ls -la /data/adb/modules',
    `echo; echo "===== daemon info ====="; "${ptracer}" info 2>&1`,
    `echo; echo "===== webui errors ====="; cat ${STATE_DIR}/webui_error.log 2>/dev/null`,
    `echo; echo "===== logcat ====="; logcat -d -v threadtime -s ${LOG_TAGS.join(' ')} 2>&1 | tail -n 4000`,
    '} > "$F" 2>&1',
    'echo "$F"'
  ].join('\n')

  toast(strings.tools.export.working)

  const result = await run(script)
  const path = result.stdout.trim().split('\n').pop()

  if (result.ok && path) toast(strings.tools.export.done.replace('{path}', path))
  else toast(strings.tools.export.failed)
}

export async function runTool(tool, strings) {
  haptic()

  switch (tool) {
    case 'logs': {
      /* INFO: Mini pages belong to their parent page, so open it first (when used from Home). */
      if (whichCurrentPage() !== 'actions') await loadPage('actions')

      loadPage('mini_actions_logs')

      break
    }
    case 'export': {
      await exportDiagnostics(strings)

      break
    }
    case 'copyState': {
      const result = await run(`/system/bin/cat ${STATE_FILE}`)
      if (!result.ok) return toast(strings.tools.copyState.failed)

      await copyText(result.stdout, strings.copied)

      break
    }
    case 'restart': {
      const ok = await confirmDialog({
        title: strings.tools.restart.confirmTitle,
        message: strings.tools.restart.confirmMessage,
        confirm: strings.tools.restart.confirm,
        cancel: strings.cancel,
        danger: true
      })
      if (!ok) return

      await run('setprop ctl.restart zygote')

      break
    }
    case 'reboot': {
      const ok = await confirmDialog({
        title: strings.tools.reboot.confirmTitle,
        message: strings.tools.reboot.confirmMessage,
        confirm: strings.tools.reboot.confirm,
        cancel: strings.cancel,
        danger: true
      })
      if (!ok) return

      await run('svc power reboot || reboot')

      break
    }
  }
}
