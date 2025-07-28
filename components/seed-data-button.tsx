"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const getUserId = async () => {
    try {
      const response = await fetch('/api/mail/seed');
      const data = await response.json();
      
      if (response.ok) {
        setUserId(data.userId);
      } else {
        setError(data.error || 'Failed to get user ID');
      }
    } catch (err) {
      setError('Network error while getting user ID');
    }
  };

  const seedData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/mail/seed', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setUserId(data.userId);
      } else {
        setError(data.error || 'Failed to seed data');
      }
    } catch (err) {
      setError('Network error while seeding data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Seed Sample Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userId && (
          <div className="text-sm text-gray-600">
            <strong>User ID:</strong> {userId}
          </div>
        )}
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Data seeded successfully! Refresh the page to see your emails.</span>
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            onClick={getUserId} 
            variant="outline" 
            size="sm" 
            className="w-full"
          >
            Get My User ID
          </Button>
          
          <Button 
            onClick={seedData} 
            disabled={loading}
            size="sm"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Seeding Data...
              </>
            ) : (
              'Seed Sample Emails'
            )}
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          This will create sample emails, threads, and attachments for your account.
        </div>
      </CardContent>
    </Card>
  );
} 