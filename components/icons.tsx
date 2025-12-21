import {
  Globe,
  Languages,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  FileText,
  Key,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Menu,
  MoreVertical,
  ArrowLeft,
  Home,
  FolderOpen,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  type LucideIcon,
} from "lucide-react";

export type Icon = LucideIcon;

export const Icons = {
  globe: Globe,
  languages: Languages,
  users: Users,
  settings: Settings,
  logout: LogOut,
  plus: Plus,
  search: Search,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  check: Check,
  close: X,
  edit: Edit2,
  delete: Trash2,
  copy: Copy,
  download: Download,
  upload: Upload,
  file: FileText,
  key: Key,
  mail: Mail,
  lock: Lock,
  eye: Eye,
  eyeOff: EyeOff,
  moon: Moon,
  sun: Sun,
  menu: Menu,
  moreVertical: MoreVertical,
  arrowLeft: ArrowLeft,
  home: Home,
  folder: FolderOpen,
  tag: Tag,
  clock: Clock,
  checkCircle: CheckCircle2,
  alertCircle: AlertCircle,
  info: Info,
  spinner: Loader2,
  logo: ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};
