"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Database, User } from 'lucide-react';

interface DatabaseStatus {
  success: boolean;
  clerkUserId: string;
  accountCount: number;
  threadCount: number;
  message: string;
}

export default function DatabaseStatus() {
  const { user } = useUser();
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mail/test');
      const data = await response.json();
      
      if (response.ok) {
        setStatus(data);
      } else {
        setError(data.error || 'Failed to check database status');
      }
    } catch (err) {
      setError('Network error while checking database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkDatabaseStatus();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Database Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Clerk ID:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {user.id}
          </Badge>
        </div>

        {/* Database Status */}
        {loading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking database...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {status && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{status.message}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{status.accountCount}</div>
                <div className="text-xs text-gray-500">Accounts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{status.threadCount}</div>
                <div className="text-xs text-gray-500">Threads</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={checkDatabaseStatus} 
          disabled={loading}
          size="sm"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Refresh Status'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 