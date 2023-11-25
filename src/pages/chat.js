// pages/chat.js
import { useRouter } from 'next/router';
import Chat from '../components/Chat';

export default function ChatPage() {
  const router = useRouter();
  const { type } = router.query; // 'text' or 'group'

  return (
    <div>
      <Chat chatType={type} />
    </div>
  );
}
