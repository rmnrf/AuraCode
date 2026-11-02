/** Feedback collection is disabled in local-only AuraCode. */
import { createContext, useContext } from "solid-js"
import type { ParentComponent, Accessor } from "solid-js"
import type { Rating, RateInput } from "./feedback-payload"

export type { Rating, RateInput } from "./feedback-payload"

interface FeedbackContextValue {
  telemetryEnabled: Accessor<boolean>
  getRating: (messageID: string) => Rating | undefined
  rate: (input: RateInput) => void
}

const FeedbackContext = createContext<FeedbackContextValue>()
const disabled = () => false

export const FeedbackProvider: ParentComponent = (props) => {
  const value: FeedbackContextValue = {
    telemetryEnabled: disabled,
    getRating: (_messageID) => undefined,
    rate: (_input) => {},
  }
  return <FeedbackContext.Provider value={value}>{props.children}</FeedbackContext.Provider>
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext)
  if (!context) throw new Error("useFeedback must be used within a FeedbackProvider")
  return context
}
