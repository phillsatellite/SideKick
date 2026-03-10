import { useState, useRef, useEffect } from "react";
import { PlusIcon, HamburgerIcon, GearIcon, SignOutIcon, ChatIcon, PencilIcon, DownloadIcon, TrashIcon } from "./Icons";
import "./Sidebar.css";

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
  onSignOut,
  onRenameConversation,
  onExportConversation,
  onDeleteConversation,
  collapsed,
  onToggleCollapse,
}) {
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, convoId: null });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const longPressTimer = useRef(null);
  const didLongPress = useRef(false);
  const menuRef = useRef(null);
  const editInputRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menu.visible) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu((m) => ({ ...m, visible: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menu.visible]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const showMenu = (x, y, convoId) => {
    const menuWidth = 164;
    const menuHeight = 124;
    const clampedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 8 : x;
    const clampedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 8 : y;
    setMenu({ visible: true, x: clampedX, y: clampedY, convoId });
  };

  const handleContextMenu = (e, convoId) => {
    e.preventDefault();
    showMenu(e.clientX, e.clientY, convoId);
  };

  const handleTouchStart = (e, convoId) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    didLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      showMenu(x, y, convoId);
    }, 600);
  };

  const handleTouchEnd = () => clearTimeout(longPressTimer.current);
  const handleTouchMove = () => clearTimeout(longPressTimer.current);

  const handleConvoClick = (convoId) => {
    if (didLongPress.current) { didLongPress.current = false; return; }
    onSelectConversation(convoId);
  };

  const closeMenu = () => setMenu((m) => ({ ...m, visible: false }));

  const startEdit = (convoId, currentTitle) => {
    closeMenu();
    setEditingId(convoId);
    setEditValue(currentTitle);
  };

  const commitEdit = () => {
    if (editValue.trim()) onRenameConversation(editingId, editValue.trim());
    setEditingId(null);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingId(null);
  };

  return (
    <>
      {!collapsed && (
        <div className="sidebar-backdrop" onClick={onToggleCollapse} />
      )}

      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-header">
          <button className="sidebar-toggle" onClick={onToggleCollapse} aria-label="Toggle sidebar">
            <HamburgerIcon />
          </button>
          <button className="sidebar-new-btn" onClick={onNewConversation}>
            <PlusIcon />
            <span>New chat</span>
          </button>
        </div>

        <div className="sidebar-conversations">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">No conversations yet</p>
          ) : (
            conversations.map((convo) => (
              editingId === convo.id ? (
                <div key={convo.id} className="sidebar-convo-edit">
                  <input
                    ref={editInputRef}
                    className="sidebar-convo-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                  />
                </div>
              ) : (
                <button
                  key={convo.id}
                  className={`sidebar-convo-btn${convo.id === activeConversationId ? " active" : ""}`}
                  onClick={() => handleConvoClick(convo.id)}
                  onContextMenu={(e) => handleContextMenu(e, convo.id)}
                  onTouchStart={(e) => handleTouchStart(e, convo.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                  title={convo.title}
                >
                  <ChatIcon />
                  <span className="sidebar-convo-title">{convo.title}</span>
                </button>
              )
            ))
          )}
        </div>

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

      {menu.visible && (
        <div
          ref={menuRef}
          className="convo-context-menu"
          style={{ left: menu.x, top: menu.y }}
        >
          <button
            className="convo-context-item"
            onClick={() => {
              const convo = conversations.find((c) => c.id === menu.convoId);
              if (convo) startEdit(convo.id, convo.title);
            }}
          >
            <PencilIcon />
            <span>Edit name</span>
          </button>
          <button
            className="convo-context-item"
            onClick={() => { closeMenu(); onExportConversation(menu.convoId); }}
          >
            <DownloadIcon />
            <span>Export</span>
          </button>
          <button
            className="convo-context-item convo-context-item--danger"
            onClick={() => { closeMenu(); onDeleteConversation(menu.convoId); }}
          >
            <TrashIcon />
            <span>Delete</span>
          </button>
        </div>
      )}
    </>
  );
}
