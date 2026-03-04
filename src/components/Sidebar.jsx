import { PlusIcon, HamburgerIcon, GearIcon, SignOutIcon, ChatIcon } from "./Icons";
import "./Sidebar.css";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
  onSignOut,
  collapsed,
  onToggleCollapse,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {!collapsed && (
        <div className="sidebar-backdrop" onClick={onToggleCollapse} />
      )}

      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label="Toggle sidebar"
          >
            <HamburgerIcon />
          </button>
          <button className="sidebar-new-btn" onClick={onNewConversation}>
            <PlusIcon />
            <span>New chat</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="sidebar-conversations">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">No conversations yet</p>
          ) : (
            conversations.map((convo) => (
              <button
                key={convo.id}
                className={`sidebar-convo-btn${convo.id === activeConversationId ? " active" : ""}`}
                onClick={() => onSelectConversation(convo.id)}
                title={convo.title}
              >
                <ChatIcon />
                <span className="sidebar-convo-title">{convo.title}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-footer-btn" onClick={onOpenSettings}>
            <GearIcon />
            <span>Settings</span>
          </button>
          <button className="sidebar-footer-btn" onClick={onSignOut}>
            <SignOutIcon />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
