import type * as vscode from "vscode"
import type { AuraConnectionService } from "../cli-backend"
/** Cloud-only completion services are omitted from the local build. */
export const registerAutocompleteProvider = async (
  _context: vscode.ExtensionContext,
  _connection: AuraConnectionService,
) => {}
