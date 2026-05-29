from abc import ABC, abstractmethod

class BaseAction(ABC):
    """
    Abstract Base Class for Chatbot Actions (adhering to Open-Closed Principle).
    To add new capabilities (such as 'Add to Cart', 'Create Booking', 'Check Booking Status'),
    simply subclass BaseAction and append the instance to the ChatOrchestrator's action list.
    """

    @abstractmethod
    def name(self) -> str:
        """Returns the unique name identifier of the action."""
        pass

    @abstractmethod
    def can_handle(self, message: str, context: dict) -> bool:
        """
        Determines if this action is suitable to handle the user's input/intent.
        Returns True or False.
        """
        pass

    @abstractmethod
    def execute(self, message: str, context: dict, engine) -> dict:
        """
        Executes the action logic and returns a dictionary response.
        Returns:
            dict: { "reply": "...", "action_taken": "...", ... }
        """
        pass


class VehicleConsultantAction(BaseAction):
    """
    Action to consult users on vehicle information and advice.
    This is the default advisor action using RAG (Vector Database + Gemini LLM).
    """

    def name(self) -> str:
        return "vehicle_consultant"

    def can_handle(self, message: str, context: dict) -> bool:
        # As the fallback/default action for consulting, it always returns True.
        # The orchestrator will evaluate other actions (e.g., cart, booking) first.
        return True

    def execute(self, message: str, context: dict, engine) -> dict:
        # Perform semantic query on the loaded database and generate a response
        history = context.get("history", [])
        reply = engine.query(message, history)
        return {
            "reply": reply,
            "action_taken": self.name()
        }


class ChatOrchestrator:
    """
    Orchestrator that handles incoming user messages using registered actions (OCP compliant).
    """
    def __init__(self, engine):
        self.engine = engine
        self.actions = []

    def register_action(self, action: BaseAction):
        """Registers a new action. Newest actions are placed first to have higher priority."""
        self.actions.insert(0, action)

    def process_message(self, message: str, context: dict) -> dict:
        """
        Processes the message by dispatching it to the first action that can handle it.
        """
        for action in self.actions:
            if action.can_handle(message, context):
                try:
                    return action.execute(message, context, self.engine)
                except Exception as e:
                    return {
                        "reply": f"Xin lỗi, đã xảy ra lỗi khi thực thi hành động '{action.name()}': {str(e)}",
                        "action_taken": action.name(),
                        "error": True
                    }
        
        return {
            "reply": "Rất tiếc, tôi không tìm thấy chức năng phù hợp để xử lý yêu cầu của bạn.",
            "action_taken": "none"
        }
