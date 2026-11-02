function board(name: string) {
  return /(?:^|_)auracode_board(?:_reset)?$/.test(name)
}

export function file(name: string, value: string) {
  return board(name) ? `// auracode_change - new file\n${value}` : value
}

export function block(name: string | undefined, source: string, value: string) {
  return (name !== undefined && board(name)) ||
    /aura_board(?:_message)?|part_session_step_finish_idx|recall_(?:part_search|message_role)_idx/.test(source)
    ? `// auracode_change start\n${value}\n// auracode_change end`
    : value
}

export function line(name: string, value: string) {
  return board(name) || name.endsWith("_auracode_model_usage_index") ? `${value} // auracode_change` : value
}
