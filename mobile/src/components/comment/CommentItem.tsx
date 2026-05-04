import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";
import { useDeleteComment, useEditComment } from "@/src/hooks/useComments";
import ConfirmDialog from "../ui/ConfirmDialog";

const formatTimeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
};

const renderContentWithMention = (content: string) => {
  const match = content.match(/^(@\w+)(\s.*)$/s);
  if (match) {
    return (
      <>
        <Text style={styles.usernameAccent}>{match[1]}</Text>
        {match[2]}
      </>
    );
  }
  return content;
};

type ReplyTarget = { id: string; userName: string };

type CommentItemProps = {
  comment: any;
  onReply?: (target: ReplyTarget) => void;
  currentUserId?: string | null;
  postId: string;
};

export default function CommentItem({
  comment,
  onReply,
  currentUserId,
  postId,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyEditText, setReplyEditText] = useState("");

  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: editComment, isPending: isSaving } = useEditComment();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const replies = comment.replies || [];
  const replyCount = comment.repliesCount ?? replies.length;

  const confirmDelete = (commentId: string) => {
  setSelectedCommentId(commentId);
  setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
  if (!selectedCommentId) return;

  deleteComment({ commentId: selectedCommentId, postId });

  setShowDeleteDialog(false);
  setSelectedCommentId(null);
  };

  const startEdit = () => {
    setEditText(comment.content);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    editComment(
      { commentId: comment.id, content: editText.trim(), postId },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const startReplyEdit = (reply: any) => {
    setReplyEditText(reply.content);
    setEditingReplyId(reply.id);
  };

  const saveReplyEdit = (replyId: string, originalContent: string) => {
    const trimmed = replyEditText.trim();
    if (!trimmed) return;

    const match = originalContent.match(/^(@\w+)\s/);
    const mention = match ? match[1] : null;

    const finalContent =
      mention && !trimmed.startsWith(mention)
        ? `${mention} ${trimmed}`
        : trimmed;

    editComment(
      {
        commentId: replyId,
        content: finalContent,
        postId,
        parentId: comment.id,
      },
      { onSuccess: () => setEditingReplyId(null) }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {comment.user?.name?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>

        <View style={styles.body}>
          {isEditing ? (
            <View style={styles.editWrapper}>
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                placeholderTextColor={COLORS.subtext}
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Text style={styles.editCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit} disabled={isSaving}>
                  <Text style={styles.editSave}>
                    {isSaving ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.commentText}>
              {comment.content}
              {comment.isEdited && (
                <Text style={styles.editedTag}> (edited)</Text>
              )}
            </Text>
          )}

          {!isEditing && (
            <View style={styles.metaRow}>
              {comment.createdAt && (
                <Text style={styles.metaText}>
                  {formatTimeAgo(comment.createdAt)}
                </Text>
              )}
              <TouchableOpacity
                onPress={() =>
                  onReply?.({
                    id: comment.id,
                    userName: comment.user?.name ?? "",
                  })
                }
              >
                <Text style={styles.metaAction}>Reply</Text>
              </TouchableOpacity>
              {currentUserId && comment.user?.id === currentUserId && (
                <>
                  <TouchableOpacity onPress={startEdit}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={14}
                      color={COLORS.subtext}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(comment.id)}>
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={14}
                      color="#ff4d4d"
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {replyCount > 0 && (
            <TouchableOpacity
              onPress={() => setShowReplies((s) => !s)}
              style={styles.viewReplies}
            >
              <View style={styles.replyLine} />
              <Text style={styles.viewRepliesText}>
                {showReplies
                  ? "Hide replies"
                  : `View ${replyCount} ${
                      replyCount === 1 ? "reply" : "replies"
                    }`}
              </Text>
            </TouchableOpacity>
          )}

          {showReplies && replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {replies.map((r: any) => (
                <View key={r.id} style={styles.replyRow}>
                  <View style={styles.replyAvatar}>
                    <Text style={styles.replyAvatarText}>
                      {r.user?.name?.charAt(0).toUpperCase() ?? "?"}
                    </Text>
                  </View>
                  <View style={styles.replyBody}>
                    {editingReplyId === r.id ? (
                      <View style={styles.editWrapper}>
                        <TextInput
                          style={styles.editInput}
                          value={replyEditText}
                          onChangeText={setReplyEditText}
                          multiline
                          autoFocus
                          placeholderTextColor={COLORS.subtext}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            onPress={() => setEditingReplyId(null)}
                          >
                            <Text style={styles.editCancel}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => saveReplyEdit(r.id, r.content)}
                            disabled={isSaving}
                          >
                            <Text style={styles.editSave}>
                              {isSaving ? "Saving..." : "Save"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.commentText}>
                        {renderContentWithMention(r.content)}
                        {r.isEdited && (
                          <Text style={styles.editedTag}> (edited)</Text>
                        )}
                      </Text>
                    )}

                    {editingReplyId !== r.id && (
                      <View style={styles.metaRow}>
                        {r.createdAt && (
                          <Text style={styles.metaText}>
                            {formatTimeAgo(r.createdAt)}
                          </Text>
                        )}
                        <TouchableOpacity
                          onPress={() =>
                            onReply?.({
                              id: comment.id,
                              userName: r.user?.name ?? "",
                            })
                          }
                        >
                          <Text style={styles.metaAction}>Reply</Text>
                        </TouchableOpacity>
                        {currentUserId && r.user?.id === currentUserId && (
                          <>
                            <TouchableOpacity onPress={() => startReplyEdit(r)}>
                              <MaterialCommunityIcons
                                name="pencil-outline"
                                size={14}
                                color={COLORS.subtext}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmDelete(r.id)}>
                              <MaterialCommunityIcons
                                name="trash-can-outline"
                                size={14}
                                color="#ff4d4d"
                              />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(111,53,186,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: COLORS.secondary,
    fontSize: 13,
    fontWeight: "600",
  },
  body: {
    flex: 1,
  },
  commentText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  usernameAccent: {
    fontWeight: "600",
    color: COLORS.secondary,
  },
  editedTag: {
    fontSize: 11,
    color: COLORS.subtext,
    fontStyle: "italic",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  metaText: {
    color: COLORS.subtext,
    fontSize: 11,
  },
  metaAction: {
    color: COLORS.subtext,
    fontSize: 11,
    fontWeight: "600",
  },
  editWrapper: {
    gap: 6,
  },
  editInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 36,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  editCancel: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "500",
  },
  editSave: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  viewReplies: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  replyLine: {
    width: 24,
    height: 1,
    backgroundColor: COLORS.border,
  },
  viewRepliesText: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "600",
  },
  repliesContainer: {
    marginTop: 8,
    gap: 8,
  },
  replyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  replyAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(111,53,186,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  replyAvatarText: {
    color: COLORS.secondary,
    fontSize: 11,
    fontWeight: "600",
  },
  replyBody: {
    flex: 1,
  },
});