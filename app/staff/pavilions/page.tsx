/**
 * SISMP — Pavilion Manager & Stall Allocation Screen
 * Features:
 * - Interactive visual stall layout map (Hall A, B, C)
 * - Real-time stall statuses: Available, Allocated, Setup In Progress, Ready
 * - Stall Allocation Requests Queue with approve/reject actions
 * - Electrical power (KW) & Wi-Fi resource fulfillment tracking
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/patterns/StatusBadge';
import { STALL_STATUSES } from '@/lib/constants/statuses';
import {
  MOCK_STALLS,
  MOCK_ALLOCATION_REQUESTS,
  type StallRecord,
  type StallAllocationRequest,
} from '@/lib/api/mocks/crmMockData';
import {
  Grid,
  CheckCircle2,
  XCircle,
  Zap,
  Wifi,
  Building,
  Layers,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PavilionsPage() {
  const [stalls, setStalls] = useState<StallRecord[]>(MOCK_STALLS);
  // Using any to match API response schema which differs slightly from mock type
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedStall, setSelectedStall] = useState<StallRecord | null>(stalls[0]);
  const [activeHall, setActiveHall] = useState('Hall A (Manufacturing)');

  const filteredStalls = stalls.filter((s) => s.hallName === activeHall);

  useEffect(() => {
    fetch('/api/v1/requests/pavilions')
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP error ${r.status}`);
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then(d => {
        if (d.success && d.data) {
          const sortedRequests = d.data.sort((a: any, b: any) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
          setRequests(sortedRequests);
        }
      })
      .catch(console.error);
  }, []);

  const handleApproveRequest = async (reqId: string) => {
    if (!selectedStall) {
      alert('Please select an available stall on the map first to allocate this request.');
      return;
    }
    
    if (selectedStall.status !== 'Available') {
      alert(`Stall ${selectedStall.stallNumber} is not Available. Please select an available stall.`);
      return;
    }

    try {
      await fetch('/api/v1/requests/pavilions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, status: 'Approved' })
      });
      
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'Approved', preferredStallNumber: selectedStall.stallNumber } : r))
      );
      setStalls((prev) =>
        prev.map((s) => {
          if (s.id === selectedStall.id) {
            return {
              ...s,
              status: STALL_STATUSES.ALLOCATED,
              companyName: requests.find((r) => r.id === reqId)?.companyName,
            };
          }
          return s;
        })
      );
      
      // Update selected stall view
      setSelectedStall(prev => prev ? {
        ...prev, 
        status: STALL_STATUSES.ALLOCATED, 
        companyName: requests.find((r) => r.id === reqId)?.companyName
      } : null);

    } catch(err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      await fetch('/api/v1/requests/pavilions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reqId, status: 'Rejected' })
      });
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'Rejected' } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Header Toolbar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pavilion Stall Layout & Resource Management</h1>
          <p className="text-xs text-foreground-muted">
            Interactive floor plan mapping, stall allocation queue, and power/utility resource tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['Hall A (Manufacturing)', 'Hall B (IT & Innovation)', 'Hall C (Renewable Energy)'].map((hall) => (
            <button
              key={hall}
              onClick={() => setActiveHall(hall)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                activeHall === hall ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-foreground border-border hover:bg-background'
              )}
            >
              {hall.split(' ')[0]} {hall.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Interactive Floor Plan Layout Map */}
        <div className="lg:col-span-7 p-6 border-r border-border overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider flex items-center gap-2">
              <Grid className="w-4 h-4 text-primary" /> Visual Stall Map — {activeHall}
            </h2>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-green-700">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Available
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Allocated
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Setup In Progress
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Ready
              </span>
            </div>
          </div>

          {/* Interactive Visual Stall Map Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredStalls.map((stall) => {
              const isSelected = selectedStall?.id === stall.id;

              return (
                <div
                  key={stall.id}
                  onClick={() => setSelectedStall(stall)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all duration-200 space-y-3 relative overflow-hidden',
                    isSelected ? 'ring-2 ring-primary border-primary shadow-md' : 'bg-surface border-border hover:shadow-md'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-data text-base font-extrabold text-primary">{stall.stallNumber}</span>
                    <StatusBadge status={stall.status} size="sm" />
                  </div>

                  <div>
                    <span className="text-[10px] text-foreground-subtle block">Size: {stall.sizeSqM} sq.m</span>
                    <h3 className="text-xs font-bold text-foreground truncate mt-0.5">
                      {stall.companyName || 'Unallocated Space'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-border/40 text-[10px] text-foreground-subtle font-data">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" /> {stall.powerReqKW} kW
                    </span>
                    {stall.wifiNeeded && (
                      <span className="flex items-center gap-1 text-primary">
                        <Wifi className="w-3 h-3" /> Wi-Fi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Stall Specification Card */}
          {selectedStall && (
            <Card padding="md" variant="default" className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div>
                  <span className="font-data font-bold text-sm text-primary">{selectedStall.stallNumber}</span>
                  <h3 className="text-base font-bold text-foreground">{selectedStall.companyName || 'Available Space'}</h3>
                </div>
                <StatusBadge status={selectedStall.status} size="md" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-foreground-subtle block">Hall:</span>
                  <span className="font-medium text-foreground">{selectedStall.hallName}</span>
                </div>
                <div>
                  <span className="text-foreground-subtle block">Power Load:</span>
                  <span className="font-data font-semibold text-amber-700">{selectedStall.powerReqKW} kW</span>
                </div>
                <div>
                  <span className="text-foreground-subtle block">Network:</span>
                  <span className="font-semibold text-primary">{selectedStall.wifiNeeded ? 'High-Speed Wi-Fi' : 'Standard'}</span>
                </div>
              </div>

              {selectedStall.specialRequests && (
                <p className="text-xs text-foreground bg-background p-2.5 rounded border border-border">
                  <span className="font-bold text-foreground-subtle">Special Setup Notes:</span> &ldquo;{selectedStall.specialRequests}&rdquo;
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right Side: Stall Allocation Requests Queue */}
        <div className="lg:col-span-5 p-6 bg-surface overflow-y-auto space-y-4">
          <h2 className="text-xs font-bold text-foreground-subtle uppercase tracking-wider">
            Stall Allocation Requests Inbox ({requests.length})
          </h2>

          <div className="space-y-3">
            {requests.map((req) => (
              <Card key={req.id} padding="md" variant="default" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-data text-xs font-bold text-primary">{req.id}</span>
                    <h3 className="text-sm font-bold text-foreground">{req.companyName}</h3>
                    <p className="text-xs text-foreground-muted">Applicant: {req.applicantName}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-background p-2.5 rounded border border-border">
                  <div>
                    <span className="text-foreground-subtle block text-[10px]">Preferred Hall & Stall:</span>
                    <span className="font-bold text-primary">{req.requestedHall} ({req.preferredStallNumber})</span>
                  </div>
                  <div>
                    <span className="text-foreground-subtle block text-[10px]">Power Load Required:</span>
                    <span className="font-data font-bold text-amber-700">{req.powerRequirementKW} kW</span>
                  </div>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => handleRejectRequest(req.id)}>
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </Button>
                    <Button variant="accent" size="sm" onClick={() => handleApproveRequest(req.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Allocate
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
