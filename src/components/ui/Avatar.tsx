// Avatar del perfil con soporte de foto base64 y placeholder con iniciales
interface AvatarProps {
  nombre?: string;
  foto?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const tamaños = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

export function Avatar({ nombre = '', foto, size = 'md', className = '' }: AvatarProps) {
  // Iniciales: primera letra del primer y segundo nombre/apellido
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <div
      className={`
        ${tamaños[size]}
        rounded-full overflow-hidden flex-shrink-0
        flex items-center justify-center
        font-titulo font-bold
        bg-quarte-azul text-white
        ${className}
      `}
    >
      {foto ? (
        <img src={foto} alt={nombre} className="w-full h-full object-cover" />
      ) : (
        <span>{iniciales || '?'}</span>
      )}
    </div>
  );
}
