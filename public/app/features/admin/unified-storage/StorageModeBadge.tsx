import { Badge } from '@grafana/ui';

interface Props {
  mode: string;
}

export function StorageModeBadge({ mode }: Props) {
  switch (mode) {
    case 'unified':
      return <Badge text={mode} color="green" />;
    case 'dual-write':
      return <Badge text={mode} color="blue" />;
    case 'legacy':
      return <Badge text={mode} color="orange" />;
    default:
      return <Badge text={mode} color="purple" />;
  }
}
