import { useState } from "react";
import {
  useDriverQueue,
  useDriverDetail,
  useUpdateDriverStatus,
  usePassengerQueue,
  usePassengerDetail,
  useUpdatePassengerStatus,
} from "../../features/documents/hooks/useDocuments";
import type {
  VerificationStatus,
  DriverQueueItem,
  PassengerQueueItem,
  DriverDocuments,
  UpdateStatusPayload,
} from "../../features/documents/types/documents.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-GB");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#4F46E5",
  "#059669",
  "#DC2626",
  "#7C3AED",
  "#B45309",
  "#0891B2",
  "#BE185D",
  "#065F46",
];
function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_STYLES: Record<string, string> = {
  pending_review: "bg-[#FEF9C2] text-[#894B00] border border-[#FFF085]",
  under_review: "bg-blue-50 text-blue-700 border border-blue-200",
  needs_info: "bg-orange-50 text-orange-700 border border-orange-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  needs_info: "Needs Info",
  approved: "Approved",
  rejected: "Rejected",
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-700">
        {message ?? "Failed to load data"}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-[#3894A3] font-medium hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function DocBadge({ label, submitted }: { label: string; submitted: boolean }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-medium ${submitted ? "bg-[#F0FDF4] text-emerald-700" : "bg-red-50 text-red-600"}`}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {submitted ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        )}
      </svg>
      {label}
    </div>
  );
}

function DocImageItem({
  label,
  item,
}: {
  label: string;
  item: { isSubmitted: boolean; url: string | null; type?: string };
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-700">
          {label}
          {item.type ? ` (${item.type})` : ""}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isSubmitted ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
        >
          {item.isSubmitted ? "✓ Submitted" : "✕ Missing"}
        </span>
      </div>
      {item.isSubmitted && item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-[#3894A3] hover:underline"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          View Document
        </a>
      ) : (
        <p className="text-xs text-gray-400">No document uploaded</p>
      )}
    </div>
  );
}

// ─── Driver Detail Modal ──────────────────────────────────────────────────────

function DriverDetailModal({
  driverId,
  onClose,
  onAction,
  isPending,
}: {
  driverId: string;
  onClose: () => void;
  onAction: (driverId: string, status: UpdateStatusPayload["status"]) => void;
  isPending: boolean;
}) {
  const { data: driver, isLoading, isError } = useDriverDetail(driverId);

  const docEntries = driver
    ? ([
        ["Valid ID", driver.documents.validId],
        ["Profile Photo", driver.documents.profilePhoto],
        ["Driver's License", driver.documents.driversLicense],
        ["Driver's Insurance", driver.documents.driversInsurance],
        ["LASSRA Card", driver.documents.lassraCard],
        ["LASDRI Card", driver.documents.lasdriCard],
      ] as [string, { isSubmitted: boolean; url: string; type?: string }][])
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">
              Verification Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {driver?.verificationId ?? "Loading..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="p-10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#3894A3] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        {isError && (
          <div className="p-8">
            <ErrorState message="Failed to load driver details" />
          </div>
        )}

        {driver && (
          <>
            <div className="p-5 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                  style={{
                    backgroundColor: colorFromName(
                      driver.personalInfo.fullName,
                    ),
                  }}
                >
                  {getInitials(driver.personalInfo.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {driver.personalInfo.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {driver.personalInfo.location}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_STYLES[driver.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {STATUS_LABELS[driver.status] ?? driver.status}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: driver.personalInfo.email },
                  { label: "Phone", value: driver.personalInfo.phone },
                  {
                    label: "Home Address",
                    value: driver.personalInfo.homeAddress,
                  },
                  {
                    label: "Submitted",
                    value: fmtDate(driver.personalInfo.submittedDate),
                  },
                  { label: "Verification ID", value: driver.verificationId },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-gray-900 text-sm break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Documents */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Documents
                </p>
                <div className="space-y-2">
                  {docEntries.map(([label, doc]) => (
                    <DocImageItem key={label} label={label} item={doc} />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 space-y-2">
              {driver.status !== "approved" && (
                <button
                  onClick={() => {
                    onAction(driver.driverId, "approved");
                    onClose();
                  }}
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Approve
                </button>
              )}
              {driver.status !== "under_review" &&
                driver.status !== "approved" && (
                  <button
                    onClick={() => {
                      onAction(driver.driverId, "under_review");
                      onClose();
                    }}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white transition-colors"
                  >
                    Mark as Under Review
                  </button>
                )}
              {driver.status !== "needs_info" &&
                driver.status !== "approved" && (
                  <button
                    onClick={() => {
                      onAction(driver.driverId, "needs_info");
                      onClose();
                    }}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-60 transition-colors"
                  >
                    Request Info
                  </button>
                )}
              {driver.status !== "rejected" && driver.status !== "approved" && (
                <button
                  onClick={() => {
                    onAction(driver.driverId, "rejected");
                    onClose();
                  }}
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Reject
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Passenger Detail Modal ───────────────────────────────────────────────────

function PassengerDetailModal({
  passengerId,
  onClose,
  onAction,
  isPending,
}: {
  passengerId: string;
  onClose: () => void;
  onAction: (
    passengerId: string,
    status: UpdateStatusPayload["status"],
  ) => void;
  isPending: boolean;
}) {
  const {
    data: passenger,
    isLoading,
    isError,
  } = usePassengerDetail(passengerId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">
              Passenger Verification Details
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {passenger?.verificationId ?? "Loading..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="p-10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#3894A3] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        {isError && (
          <div className="p-8">
            <ErrorState message="Failed to load passenger details" />
          </div>
        )}

        {passenger && (
          <>
            <div className="p-5 space-y-4">
              {/* Profile */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                  style={{
                    backgroundColor: colorFromName(
                      passenger.personalInfo.fullName,
                    ),
                  }}
                >
                  {getInitials(passenger.personalInfo.fullName)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {passenger.personalInfo.fullName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {passenger.personalInfo.location}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_STYLES[passenger.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {STATUS_LABELS[passenger.status] ?? passenger.status}
                  </span>
                </div>
              </div>

              {/* Personal info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: passenger.personalInfo.email },
                  { label: "Phone", value: passenger.personalInfo.phone },
                  { label: "Location", value: passenger.personalInfo.location },
                  {
                    label: "Submitted",
                    value: fmtDate(passenger.personalInfo.submittedDate),
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-gray-900 text-sm break-all">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Vehicle */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Vehicle
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Make</p>
                    <p className="font-medium text-gray-900">
                      {passenger.vehicle?.make}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Model</p>
                    <p className="font-medium text-gray-900">
                      {passenger.vehicle?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Year</p>
                    <p className="font-medium text-gray-900">
                      {passenger.vehicle?.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Plate</p>
                    <p className="font-medium text-gray-900">
                      {passenger.vehicle?.plateNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents grouped */}
              {[
                {
                  label: "Identity",
                  docs: [
                    ["Valid ID", passenger.documents.identity.validId],
                    [
                      "Profile Photo",
                      passenger.documents.identity.profilePhoto,
                    ],
                  ],
                },
                {
                  label: "Interior Photos",
                  docs: [
                    [
                      "Dashboard & Steering",
                      passenger.documents.interiorPhotos.dashboardSteering,
                    ],
                    [
                      "Front Seats",
                      passenger.documents.interiorPhotos.frontSeats,
                    ],
                    [
                      "Back Seats",
                      passenger.documents.interiorPhotos.backSeats,
                    ],
                  ],
                },
                {
                  label: "Exterior Photos",
                  docs: [
                    [
                      "Front View",
                      passenger.documents.exteriorPhotos.frontView,
                    ],
                    ["Back View", passenger.documents.exteriorPhotos.backView],
                    [
                      "Left Side",
                      passenger.documents.exteriorPhotos.leftSideView,
                    ],
                    [
                      "Right Side",
                      passenger.documents.exteriorPhotos.rightSideView,
                    ],
                  ],
                },
                {
                  label: "Vehicle Paperwork",
                  docs: [
                    [
                      "Proof of Ownership",
                      passenger.documents.vehiclePaperwork.proofOfOwnership,
                    ],
                    [
                      "VIS Report",
                      passenger.documents.vehiclePaperwork.visReport,
                    ],
                    [
                      "Third Party Insurance",
                      passenger.documents.vehiclePaperwork.thirdPartyInsurance,
                    ],
                    [
                      "Road Worthiness",
                      passenger.documents.vehiclePaperwork
                        .roadWorthinessCertificate,
                    ],
                  ],
                },
              ].map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {(
                      group.docs as [
                        string,
                        {
                          isSubmitted: boolean;
                          url: string | null;
                          type?: string;
                        },
                      ][]
                    ).map(([label, doc]) => (
                      <DocImageItem key={label} label={label} item={doc} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 space-y-2">
              {passenger.status !== "approved" && (
                <button
                  onClick={() => {
                    onAction(passenger.passengerId, "approved");
                    onClose();
                  }}
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Approve
                </button>
              )}
              {passenger.status !== "under_review" &&
                passenger.status !== "approved" && (
                  <button
                    onClick={() => {
                      onAction(passenger.passengerId, "under_review");
                      onClose();
                    }}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white transition-colors"
                  >
                    Mark as Under Review
                  </button>
                )}
              {passenger.status !== "needs_info" &&
                passenger.status !== "approved" && (
                  <button
                    onClick={() => {
                      onAction(passenger.passengerId, "needs_info");
                      onClose();
                    }}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-60 transition-colors"
                  >
                    Request Info
                  </button>
                )}
              {passenger.status !== "rejected" &&
                passenger.status !== "approved" && (
                  <button
                    onClick={() => {
                      onAction(passenger.passengerId, "rejected");
                      onClose();
                    }}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Reject
                  </button>
                )}
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Driver Queue Tab ─────────────────────────────────────────────────────────

type FilterTab =
  | "all"
  | "pending_review"
  | "under_review"
  | "needs_info"
  | "approved"
  | "rejected";

function DriverQueueTab() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useDriverQueue({
    page,
    limit: 10,
  });
    console.log(data)
  const { mutate: updateStatus, isPending } = useUpdateDriverStatus();

  const kpis = data?.kpis;
  const allDrivers = data?.queue ?? [];
  const pagination = data?.pagination;

  const filtered =
    filter === "all"
      ? allDrivers
      : allDrivers.filter((d) => d.status === filter);

  function handleAction(
    driverId: string,
    status: UpdateStatusPayload["status"],
  ) {
    updateStatus({ driverId, payload: { status } });
  }

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending_review", label: "Pending" },
    { key: "under_review", label: "Under Review" },
    { key: "needs_info", label: "Needs Info" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-8" />
                  </div>
                </div>
              </div>
            ))
          : kpis
            ? [
                {
                  label: "Pending Review",
                  value: kpis.pendingReview,
                  bg: "bg-amber-50",
                  color: "text-amber-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Under Review",
                  value: kpis.underReview,
                  bg: "bg-blue-50",
                  color: "text-blue-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Needs Info",
                  value: kpis.needsInfo,
                  bg: "bg-orange-50",
                  color: "text-orange-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {s.value}
                    </p>
                  </div>
                </div>
              ))
            : null}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto mb-5 pb-0.5">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === t.key ? "bg-[#3894A3] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState message="Failed to load driver queue" onRetry={refetch} />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">
              No requests found
            </div>
          ) : (
            filtered.map((driver: DriverQueueItem) => {
              const docs = driver.documents;
              const docList = [
                { name: "Valid ID", submitted: docs.validId?.isSubmitted },
                {
                  name: "Profile Photo",
                  submitted: docs.profilePhoto?.isSubmitted,
                },
                {
                  name: "Driver's License",
                  submitted: docs.driversLicense?.isSubmitted,
                },
                {
                  name: "Driver's Insurance",
                  submitted: docs.driversInsurance?.isSubmitted,
                },
                {
                  name: "LASSRA Card",
                  submitted: docs.lassraCard?.isSubmitted,
                },
                {
                  name: "LASDRI Card",
                  submitted: docs.lasdriCard?.isSubmitted,
                },
              ];
              return (
                <div
                  key={driver.driverId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                          style={{
                            backgroundColor: colorFromName(
                              driver.personalInfo.fullName,
                            ),
                          }}
                        >
                          {getInitials(driver.personalInfo.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {driver.personalInfo.fullName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {driver.personalInfo.location}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[driver.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {STATUS_LABELS[driver.status] ?? driver.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Email", value: driver.personalInfo.email },
                        { label: "Phone", value: driver.personalInfo.phone },
                        {
                          label: "Verification ID",
                          value: driver.verificationId,
                        },
                        {
                          label: "Submitted",
                          value: fmtDate(driver.personalInfo.submittedDate),
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="text-sm font-medium text-gray-900 break-all">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Docs */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Documents Submitted
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {docList.map((doc) => (
                          <DocBadge
                            key={doc.name}
                            label={doc.name}
                            submitted={!!doc.submitted}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedId(driver.driverId)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Details
                      </button>
                      {driver.status !== "approved" && (
                        <button
                          onClick={() =>
                            handleAction(driver.driverId, "approved")
                          }
                          disabled={isPending}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#00A63E] hover:bg-emerald-600 disabled:opacity-60 text-white transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Approve
                        </button>
                      )}
                      {driver.status !== "needs_info" &&
                        driver.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleAction(driver.driverId, "needs_info")
                            }
                            disabled={isPending}
                            className="w-full py-2.5 rounded-[7px] text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                          >
                            Request Info
                          </button>
                        )}
                      {driver.status !== "rejected" &&
                        driver.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleAction(driver.driverId, "rejected")
                            }
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-[7px] text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Reject
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages} —{" "}
                {pagination.total} total
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <DriverDetailModal
          driverId={selectedId}
          onClose={() => setSelectedId(null)}
          onAction={handleAction}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ─── Passenger Queue Tab ──────────────────────────────────────────────────────

function PassengerQueueTab() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = usePassengerQueue({
    page,
    limit: 10,
  });
  console.log(data)
  const { mutate: updateStatus, isPending } = useUpdatePassengerStatus();

  const kpis = data?.kpis;
  const allPassengers = data?.queue ?? [];
  const pagination = data?.pagination;

  const filtered =
    filter === "all"
      ? allPassengers
      : allPassengers.filter((p) => p.status === filter);

  function handleAction(
    passengerId: string,
    status: UpdateStatusPayload["status"],
  ) {
    updateStatus({ passengerId, payload: { status } });
  }

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending_review", label: "Pending" },
    { key: "under_review", label: "Under Review" },
    { key: "needs_info", label: "Needs Info" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <>
      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-8" />
                  </div>
                </div>
              </div>
            ))
          : kpis
            ? [
                {
                  label: "Pending Review",
                  value: kpis.pendingReview,
                  bg: "bg-amber-50",
                  color: "text-amber-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Under Review",
                  value: kpis.underReview,
                  bg: "bg-blue-50",
                  color: "text-blue-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Needs Info",
                  value: kpis.needsInfo,
                  bg: "bg-orange-50",
                  color: "text-orange-600",
                  icon: (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3"
                >
                  <div
                    className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {s.value}
                    </p>
                  </div>
                </div>
              ))
            : null}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto mb-5 pb-0.5">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === t.key ? "bg-[#3894A3] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isError ? (
        <ErrorState
          message="Failed to load passenger queue"
          onRetry={refetch}
        />
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 text-sm">
              No requests found
            </div>
          ) : (
            filtered.map((passenger: PassengerQueueItem) => {
              const docs = passenger.documentsSubmitted;
              const docList = [
                { name: "Valid ID", submitted: docs.validId },
                { name: "Profile Photo", submitted: docs.profilePhoto },
                { name: "Dashboard", submitted: docs.dashboardSteering },
                { name: "Front Seats", submitted: docs.frontSeatsInterior },
                { name: "Back Seats", submitted: docs.backSeatsInterior },
                { name: "Front View", submitted: docs.frontViewExterior },
                { name: "Back View", submitted: docs.backViewExterior },
                { name: "Left Side", submitted: docs.leftSideView },
                { name: "Right Side", submitted: docs.rightSideView },
                {
                  name: "Proof of Ownership",
                  submitted: docs.vehicleProofOfOwnership,
                },
                { name: "VIS Report", submitted: docs.visReport },
                {
                  name: "3rd Party Insurance",
                  submitted: docs.thirdPartyInsurance,
                },
                {
                  name: "Road Worthiness",
                  submitted: docs.roadWorthinessCertificate,
                },
              ];
              return (
                <div
                  key={passenger.passengerId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0"
                          style={{
                            backgroundColor: colorFromName(
                              passenger.personalInfo.fullName,
                            ),
                          }}
                        >
                          {getInitials(passenger.personalInfo.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {passenger.personalInfo.fullName}
                          </p>
                          <p className="text-sm text-gray-400">
                            {passenger.personalInfo.location}
                          </p>
                          <p className="text-xs text-gray-400">
                            {passenger.vehicle?.model} ·{" "}
                            {passenger.vehicle?.plateNumber}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[passenger.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {STATUS_LABELS[passenger.status] ?? passenger.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Email", value: passenger.personalInfo.email },
                        { label: "Phone", value: passenger.personalInfo.phone },
                        {
                          label: "Verification ID",
                          value: passenger.verificationId,
                        },
                        {
                          label: "Submitted",
                          value: fmtDate(passenger.personalInfo.submittedDate),
                        },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-xs text-gray-400">{item.label}</p>
                          <p className="text-sm font-medium text-gray-900 break-all">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Documents Submitted
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {docList.map((doc) => (
                          <DocBadge
                            key={doc.name}
                            label={doc.name}
                            submitted={doc.submitted}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedId(passenger.passengerId)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#3894A3] hover:bg-[#2F7F8C] text-white transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        View Details
                      </button>
                      {passenger.status !== "approved" && (
                        <button
                          onClick={() =>
                            handleAction(passenger.passengerId, "approved")
                          }
                          disabled={isPending}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[7px] text-sm font-medium bg-[#00A63E] hover:bg-emerald-600 disabled:opacity-60 text-white transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Approve
                        </button>
                      )}
                      {passenger.status !== "needs_info" &&
                        passenger.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleAction(passenger.passengerId, "needs_info")
                            }
                            disabled={isPending}
                            className="w-full py-2.5 rounded-[7px] text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-60 transition-colors"
                          >
                            Request Info
                          </button>
                        )}
                      {passenger.status !== "rejected" &&
                        passenger.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleAction(passenger.passengerId, "rejected")
                            }
                            disabled={isPending}
                            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-[7px] text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Reject
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-400">
                Page {pagination.page} of {pagination.totalPages} —{" "}
                {pagination.total} total
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === n ? "bg-[#3894A3] text-white" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <PassengerDetailModal
          passengerId={selectedId}
          onClose={() => setSelectedId(null)}
          onAction={handleAction}
          isPending={isPending}
        />
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = "drivers" | "passengers";

export default function ManageDocuments() {
  const [tab, setTab] = useState<MainTab>("drivers");

  return (
    <div className="bg-[#F1F9FB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            Verification Queue
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve driver and passenger verification requests
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {(
            [
              { key: "drivers", label: "Drivers" },
              { key: "passengers", label: "Passengers" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? "bg-white border border-gray-200 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/60"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "drivers" ? <DriverQueueTab /> : <PassengerQueueTab />}
      </div>
    </div>
  );
}
