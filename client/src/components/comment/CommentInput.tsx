import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useAddComment } from "@/src/hooks/useComments";
import { COLORS } from "@/src/theme/colors";

type ReplyTarget = { id: string; userName: string };

export type CommentInputHandle = {
  open: (replyTo?: ReplyTarget | null) => void;
  close: () => void;
};

type CommentInputProps = {
  postId: string;
};

const CommentInput = forwardRef<CommentInputHandle, CommentInputProps>(
  ({ postId }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
    const { mutate: addComment, isPending } = useAddComment();

    const snapPoints = useMemo(() => ["100%"], []);

    useImperativeHandle(ref, () => ({
      open: (target?: ReplyTarget | null) => {
        setReplyTo(target ?? null);
        sheetRef.current?.present();
      },
      close: () => {
        sheetRef.current?.dismiss();
      },
    }));

    const handleSend = () => {
      const content = text.trim();
      if (!content) return;

      const finalContent =
      replyTo && !content.startsWith(`@${replyTo.userName}`)
      ? `@${replyTo.userName} ${content}`
      : content;

      addComment(
        {
          postId,
          content: finalContent,
          ...(replyTo ? { parentId: replyTo.id } : {}),
        },
        {
          onSuccess: () => {
            setText("");
            setReplyTo(null);
            Keyboard.dismiss();
            sheetRef.current?.dismiss();
          },
        }
      );
    };

    const handleDismiss = useCallback(() => {
      setReplyTo(null);
    }, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        onDismiss={handleDismiss}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Comments</Text>
        </BottomSheetView>

        <View style={styles.footerWrap}>
          {replyTo && (
            <View style={styles.replyingBar}>
              <Text style={styles.replyingText}>
                Replying to{" "}
                <Text style={styles.replyingName}>@{replyTo.userName}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)} hitSlop={8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputRow}>
            <BottomSheetTextInput
              value={text}
              onChangeText={setText}
              placeholder={
                replyTo
                  ? `Reply to @${replyTo.userName}...`
                  : "Add a comment..."
              }
              placeholderTextColor={COLORS.subtext}
              style={styles.input}
              multiline
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={isPending || !text.trim()}
            >
              <Text
                style={[
                  styles.postBtn,
                  (!text.trim() || isPending) && styles.postBtnDisabled,
                ]}
              >
                Post
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

CommentInput.displayName = "CommentInput";

export default CommentInput;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.background,
  },
  handle: {
    backgroundColor: COLORS.subtext,
    width: 40,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 24,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  spacer: {
    flex: 1,
  },
  footerWrap: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  replyingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(111,53,186,0.12)",
    borderRadius: 8,
    marginTop: 10,
  },
  replyingText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  replyingName: {
    color: COLORS.secondary,
    fontWeight: "600",
  },
  cancelText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
    marginTop: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 18,
  },
  postBtn: {
    color: COLORS.secondary,
    fontWeight: "700",
    fontSize: 14,
  },
  postBtnDisabled: {
    opacity: 0.4,
  },
});