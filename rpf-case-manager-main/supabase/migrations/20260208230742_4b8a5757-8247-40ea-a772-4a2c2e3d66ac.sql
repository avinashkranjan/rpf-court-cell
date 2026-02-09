-- Create activity logs table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs 
FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own activity logs
CREATE POLICY "Users can create own activity logs" ON public.activity_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins/Supervisors can view all activity logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs 
FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor')
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);