import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface IModalInactivityWarningProps {
  open: boolean;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

const ModalInactivityWarning = ({
  open,
  onStayLoggedIn,
  onLogout
}: IModalInactivityWarningProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="border-0">
          <DialogTitle className="sr-only">Session Expiring</DialogTitle>
          <DialogDescription className="sr-only">
            Your session is idle and will be logged out soon unless you stay signed in or log out
            now.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col items-center pt-0 pb-10">
          <h3 className="text-lg font-medium text-yellow-600 text-center mb-3">Session Expiring</h3>

          <div className="text-2sm text-center text-gray-700 mb-7">
            Inactivity detected. Press any key to prevent being logged out. This is a required
            security feature.
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onLogout} className="btn btn-outline flex justify-center">
              Log Out
            </button>
            <button onClick={onStayLoggedIn} className="btn btn-primary flex justify-center">
              Stay Logged In
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export { ModalInactivityWarning };
