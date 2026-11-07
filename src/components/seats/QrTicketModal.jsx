import React, { useState, useEffect } from 'react';
import { 
  Download, QrCode, CheckCircle2, Copy, Check, Ticket, Clock, Armchair, Building 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { bookingApi } from '../../api/bookingApi';
import { useToast } from '../../context/ToastContext';

export const QrTicketModal = ({ 
  isOpen, 
  onClose, 
  booking, 
  show, 
  movie, 
  screen 
}) => {
  const { showToast } = useToast();
  const [qrUrl, setQrUrl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let activeUrl = null;
    if (isOpen && booking?.id) {
      bookingApi.getTicketQrBlob(booking.bookingId || booking.id)
        .then((url) => {
          activeUrl = url;
          setQrUrl(url);
        })
        .catch((err) => {
          console.error('Failed to load QR code blob:', err);
          showToast('Failed to load QR code pass', 'error');
        });
    }

    return () => {
      if (activeUrl) {
        window.URL.revokeObjectURL(activeUrl);
      }
      setQrUrl(null);
    };
  }, [isOpen, booking, showToast]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await bookingApi.downloadTicketPdf(booking.bookingId || booking.id);
      showToast('Digital PDF ticket downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error downloading ticket PDF:', err);
      showToast('Failed to download PDF ticket pass', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToken = () => {
    const token = booking?.ticketToken || `BOOKING:${booking?.id}`;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Ticket Token copied to clipboard', 'info');
  };

  if (!booking) return null;

  const bId = booking.bookingId || booking.id;
  const isCheckedIn = !!booking.checkedInAt;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Cinema Admission Pass"
      maxWidth="max-w-md"
    >
      <div className="space-y-5 animate-fadeIn">
        {/* Pass Header Banner */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Official Pass</span>
            <p className="text-sm font-bold text-white flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-rose-500" />
              REF #{bId}
            </p>
          </div>
          <div>
            {isCheckedIn ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Admission Valid
              </span>
            )}
          </div>
        </div>

        {/* Scannable QR Code Canvas */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 shadow-xl">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR Code Pass for Booking #${bId}`}
              className="w-48 h-48 object-contain rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-slate-400">
              <QrCode className="w-10 h-10 animate-pulse text-slate-400" />
              <span className="text-xs">Generating QR Pass...</span>
            </div>
          )}

          <div className="w-full mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-mono text-[11px] truncate max-w-[200px]" title={booking.ticketToken}>
              {booking.ticketToken || 'Token Pending'}
            </span>
            <button
              onClick={handleCopyToken}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Screening Details Summary */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Movie</span>
            <span className="font-bold text-white text-right max-w-[200px] truncate">
              {movie?.title || `Show #${booking.showId}`}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              Theatre & Screen
            </span>
            <span className="font-semibold text-slate-200 text-right">
              {screen?.name || `Screen ${show?.screenId || 1}`} • {screen?.theatreName || 'Cinepass Hall'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Showtime
            </span>
            <span className="font-semibold text-slate-200">
              {show?.showTime ? new Date(show.showTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 flex items-center gap-1">
              <Armchair className="w-3.5 h-3.5 text-slate-500" />
              Seats ({booking.seatNumbers?.length || 0})
            </span>
            <span className="font-mono font-bold text-rose-400">
              {booking.seatNumbers?.join(', ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-sm font-semibold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

