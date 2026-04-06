import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="text-center space-y-4 max-w-md">
              <h2 className="text-2xl font-bold text-foreground">
                Terjadi Kesalahan
              </h2>
              <p className="text-muted-foreground">
                {this.state.error?.message || "Sesuatu tidak berjalan dengan baik."}
              </p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
