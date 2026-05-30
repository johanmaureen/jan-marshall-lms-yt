import { Editor, useEditorState } from "@tiptap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Toggle } from "../ui/toggle";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  Bold,
  Code,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Italic,
  ListIcon,
  ListOrdered,
  Redo,
  Strikethrough,
  Undo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
//import { ComposeAssistent } from "./ComposeAssistent";
//import { markdownToJson } from "@/lib/markdown-to-json";

interface MenuBarProps {
  editor: Editor | null;
}

export function MenuBar({ editor }: MenuBarProps) {
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) {
        return null;
      }
      return {
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isCodeBlock: editor.isActive("codeBlock"),
        isBulletList: editor.isActive("bulletList"),
        isOrderedList: editor.isActive("orderedList"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        currentContent: editor.getJSON(),
      };
    },
  });
  if (!editor) {
    return null;
  }
  /*
  const handleAcceptCompose = (markdown: string) => {
    try {
      const json = markdownToJson(markdown);
      editor.commands.setContent(json);
    } catch {}
  };
  */
  return (
    <div className="border border-input border-t-0 border-x-0 rounded-t-lg p-2 bg-card flex flex-wrap gap-1 items-center">
      <TooltipProvider>
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bold") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleBold().run()
                }
                className={cn(
                  editorState?.isBold && "bg-muted text-muted-foreground",
                )}
              >
                <Bold />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("italic") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleItalic().run()
                }
                className={cn(
                  editorState?.isItalic && "bg-muted text-muted-foreground",
                )}
              >
                <Italic />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("strike") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleStrike().run()
                }
                className={cn(
                  editorState?.isStrike && "bg-muted text-muted-foreground",
                )}
              >
                <Strikethrough />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Strike</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 1 })}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 1 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading1Icon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 2 }) ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 2 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading2Icon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("heading", { level: 3 }) ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={cn(
                  editor.isActive("heading", { level: 3 }) &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <Heading3Icon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("codeBlock") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleCodeBlock().run()
                }
                className={cn(
                  editorState?.isCodeBlock && "bg-muted text-muted-foreground",
                )}
              >
                <Code />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>
        </div>
        <div className="w-px h-6 bg-border mx-2"></div>
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("bulletList") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleBulletList().run()
                }
                className={cn(
                  editorState?.isBulletList && "bg-muted text-muted-foreground",
                )}
              >
                <ListIcon />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("orderedList") ?? false}
                onPressedChange={() =>
                  editor.chain().focus().toggleOrderedList().run()
                }
                className={cn(
                  editorState?.isOrderedList &&
                    "bg-muted text-muted-foreground",
                )}
              >
                <ListOrdered />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>Ordered List</TooltipContent>
          </Tooltip>
        </div>
        <div className="w-px h-6 bg-border mx-2"></div>
        <div className="flex flex-wrap gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => editor.chain().focus().undo().run()}
                size="sm"
                variant="ghost"
                type="button"
                disabled={!editorState?.canUndo}
              >
                <Undo />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => editor.chain().focus().redo().run()}
                size="sm"
                variant="ghost"
                type="button"
                disabled={!editorState?.canRedo}
              >
                <Redo />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>
        <div className="w-px h-6 bg-border mx-2"></div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "left" }) ?? false}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("left").run()
              }
              className={cn(
                editor.isActive({ textAlign: "left" }) &&
                  "bg-muted text-muted-foreground",
              )}
            >
              <AlignLeftIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "center" }) ?? false}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={cn(
                editor.isActive({ textAlign: "center" }) &&
                  "bg-muted text-muted-foreground",
              )}
            >
              <AlignCenterIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Center</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive({ textAlign: "right" }) ?? false}
              onPressedChange={() =>
                editor.chain().focus().setTextAlign("right").run()
              }
              className={cn(
                editor.isActive({ textAlign: "right" }) &&
                  "bg-muted text-muted-foreground",
              )}
            >
              <AlignRightIcon />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>Align Right</TooltipContent>
        </Tooltip>

        <div className="w-px h-6 bg-border mx-2"></div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => editor.commands.setColor("#0000FF")}
              size="sm"
              variant="ghost"
              type="button"
            >
              <span className="text-blue-800">B</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Blue</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => editor.commands.setColor("#FF0000")}
              size="sm"
              variant="ghost"
              type="button"
            >
              <span className="text-red-600">R</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Red</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => editor.commands.setColor("#FF8C00")}
              size="sm"
              variant="ghost"
              type="button"
            >
              <span className="text-orange-400">O</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Orange</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => editor.commands.unsetColor()}
              size="sm"
              variant="ghost"
              type="button"
            >
              X
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear Color</TooltipContent>
        </Tooltip>
        {/*
        <div className="flex flex-wrap gap-1">
          <ComposeAssistent
            content={JSON.stringify(editorState?.currentContent)}
            onAccept={handleAcceptCompose}
          />
        </div>
        */}
      </TooltipProvider>
    </div>
  );
}
