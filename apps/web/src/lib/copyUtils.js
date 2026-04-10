
import { toast } from 'sonner';

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Copied!', { duration: 2000 });
  } catch (err) {
    toast.error('Failed to copy text');
  }
};

export const copyWithReference = async (text, reference) => {
  const formattedText = `"${text}"\n— ${reference}`;
  try {
    await navigator.clipboard.writeText(formattedText);
    toast.success('Copied with reference!', { duration: 2000 });
  } catch (err) {
    toast.error('Failed to copy text');
  }
};

export const copyWithNotes = async (text, reference, notes) => {
  const formattedText = `"${text}"\n— ${reference}\n\nMy Notes:\n${notes}`;
  try {
    await navigator.clipboard.writeText(formattedText);
    toast.success('Copied with notes!', { duration: 2000 });
  } catch (err) {
    toast.error('Failed to copy text');
  }
};
