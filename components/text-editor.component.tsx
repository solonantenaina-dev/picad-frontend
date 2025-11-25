"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  List,
  ListOrdered,
  ImageIcon,
  Link,
  ChevronDown,
  Type,
  Palette,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  value?: string;
  onChange?: (value: string, plainText: string) => void;
}

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
const fontFamilies = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Tahoma, sans-serif", label: "Tahoma" },
  { value: "Trebuchet MS, sans-serif", label: "Trebuchet MS" },
];

const textColors = [
  { value: "#000000", label: "Noir" },
  { value: "#FF0000", label: "Rouge" },
  { value: "#00FF00", label: "Vert" },
  { value: "#0000FF", label: "Bleu" },
  { value: "#FFFF00", label: "Jaune" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FFA500", label: "Orange" },
  { value: "#800080", label: "Violet" },
  { value: "#008000", label: "Vert foncé" },
  { value: "#808080", label: "Gris" },
  { value: "#FFFFFF", label: "Blanc" },
];

const backgroundColors = [
  { value: "transparent", label: "Transparent" },
  { value: "#FFFF00", label: "Jaune" },
  { value: "#00FF00", label: "Vert" },
  { value: "#00FFFF", label: "Cyan" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#FF0000", label: "Rouge" },
  { value: "#0000FF", label: "Bleu" },
  { value: "#FFA500", label: "Orange" },
  { value: "#E6E6E6", label: "Gris clair" },
];

const defaultContent = `<p style="color: #16a34a; font-weight: 600; font-size: 18px;">Welcome to Kendimed Text Editor Text Editor!</p>
<p style="color: #374151;">Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien.</p>
<ul style="color: #374151;">
  <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
  <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
  <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
</ul>`;

export function TextEditor({ value, onChange }: TextEditorProps) {
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState(fontFamilies[0]);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("transparent");
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || defaultContent;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveStyles();
  }, []);

  const updateActiveStyles = useCallback(() => {
    setActiveStyles({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
    });
  }, []);

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const plainText = editorRef.current.innerText;
      onChange?.(html, plainText);
    }
    updateActiveStyles();
  }, [onChange, updateActiveStyles]);

  useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveStyles();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, [updateActiveStyles]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      execCommand("fontSize", "7");
      const fontElements =
        editorRef.current?.querySelectorAll('font[size="7"]');
      fontElements?.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        span.innerHTML = el.innerHTML;
        el.parentNode?.replaceChild(span, el);
      });
      handleContentChange();
    }
  };

  const handleFontFamilyChange = (font: (typeof fontFamilies)[0]) => {
    setFontFamily(font);
    execCommand("fontName", font.value);
    handleContentChange();
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    execCommand("foreColor", color);
    handleContentChange();
  };

  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    if (color === "transparent") {
      execCommand("removeFormat");
    } else {
      execCommand("hiliteColor", color);
    }
    handleContentChange();
  };

  const insertLink = () => {
    const url = prompt("Entrez l'URL du lien:");
    if (url) {
      execCommand("createLink", url);
      handleContentChange();
    }
  };

  const insertImage = () => {
    const url = prompt("Entrez l'URL de l'image:");
    if (url) {
      execCommand("insertImage", url);
      handleContentChange();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          execCommand("underline");
          break;
        case "z":
          e.preventDefault();
          execCommand("undo");
          break;
        case "y":
          e.preventDefault();
          execCommand("redo");
          break;
      }
    }
  };

  const ToolbarButton = ({
    onClick,
    children,
    title,
    isActive = false,
  }: {
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    isActive?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        isActive
          ? "bg-green-100 text-green-700"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  const ColorPicker = ({
    colors,
    selectedColor,
    onSelect,
    icon: Icon,
    title,
  }: {
    colors: typeof textColors;
    selectedColor: string;
    onSelect: (color: string) => void;
    icon: React.ElementType;
    title: string;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={title}
          className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <div className="relative">
            <Icon className="h-4 w-4" />
            <div
              className="absolute -bottom-1 left-0 right-0 h-1 rounded"
              style={{
                backgroundColor:
                  selectedColor === "transparent" ? "#ccc" : selectedColor,
              }}
            />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {colors.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onSelect(color.value)}
              title={color.label}
              className={cn(
                "h-6 w-6 rounded border-2 transition-transform hover:scale-110",
                selectedColor === color.value
                  ? "border-green-600"
                  : "border-transparent",
                color.value === "transparent" &&
                  "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:8px_8px] bg-[position:0_0,4px_4px]"
              )}
              style={{
                backgroundColor:
                  color.value !== "transparent" ? color.value : undefined,
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-border p-2 flex-wrap bg-muted/30">
        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-muted min-w-[50px] justify-between">
            {fontSize}
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[200px] overflow-auto">
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => handleFontSizeChange(size)}
                className={cn(fontSize === size && "bg-green-100")}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-muted">
            <Type className="h-4 w-4 mr-1" />
            <span className="max-w-[80px] truncate">{fontFamily.label}</span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fontFamilies.map((font) => (
              <DropdownMenuItem
                key={font.value}
                onClick={() => handleFontFamilyChange(font)}
                style={{ fontFamily: font.value }}
                className={cn(
                  fontFamily.value === font.value && "bg-green-100"
                )}
              >
                {font.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Text Color */}
        <ColorPicker
          colors={textColors}
          selectedColor={textColor}
          onSelect={handleTextColorChange}
          icon={Type}
          title="Couleur du texte"
        />

        {/* Background Color */}
        <ColorPicker
          colors={backgroundColors}
          selectedColor={bgColor}
          onSelect={handleBgColorChange}
          icon={Palette}
          title="Couleur de surlignage"
        />

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Formatting - Ajout des états actifs */}
        <ToolbarButton
          onClick={() => execCommand("bold")}
          title="Gras (Ctrl+B)"
          isActive={activeStyles.bold}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("italic")}
          title="Italique (Ctrl+I)"
          isActive={activeStyles.italic}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("underline")}
          title="Souligné (Ctrl+U)"
          isActive={activeStyles.underline}
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("strikeThrough")}
          title="Barré"
          isActive={activeStyles.strikeThrough}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => execCommand("justifyLeft")}
          title="Aligner à gauche"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("justifyCenter")}
          title="Centrer"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("justifyRight")}
          title="Aligner à droite"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("justifyFull")}
          title="Justifier"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => execCommand("insertUnorderedList")}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("insertOrderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => execCommand("undo")}
          title="Annuler (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => execCommand("redo")}
          title="Rétablir (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Insert */}
        <ToolbarButton onClick={insertImage} title="Insérer une image">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={insertLink} title="Insérer un lien">
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content - Zone éditable avec placeholder */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleContentChange}
        onBlur={handleContentChange}
        onKeyDown={handleKeyDown}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{ fontFamily: fontFamily.value }}
      />
    </div>
  );
}
