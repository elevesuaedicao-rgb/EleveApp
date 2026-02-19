import { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarUploadProps {
  avatarUrl?: string | null;
  fullName?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const buttonSizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export const AvatarUpload = ({ avatarUrl, fullName, size = 'lg' }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, uploading } = useAvatarUpload();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const initials = fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-xl`}>
        <AvatarImage src={avatarUrl || undefined} alt={fullName} />
        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
          {initials || <User className="w-8 h-8" />}
        </AvatarFallback>
      </Avatar>

      <button
        onClick={handleClick}
        disabled={uploading}
        className={`absolute bottom-0 right-0 ${buttonSizeClasses[size]} bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50`}
      >
        {uploading ? (
          <div className="animate-spin rounded-full border-2 border-primary-foreground border-t-transparent w-4 h-4" />
        ) : (
          <Camera className={iconSizeClasses[size]} />
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
