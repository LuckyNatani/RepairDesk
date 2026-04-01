-- Migration 004: Analytics RPC (High Performance)

-- Aggregates all analytics in a single database call, eliminating N+1 search queries in the frontend.
CREATE OR REPLACE FUNCTION get_analytics(p_business_id UUID, p_start TIMESTAMPTZ, p_end TIMESTAMPTZ)
RETURNS TABLE(
    total bigint,
    completed bigint,
    in_progress bigint,
    unassigned bigint,
    completion_rate integer,
    staff_stats jsonb
) 
LANGUAGE SQL 
STABLE SECURITY DEFINER
AS $$
WITH t_data AS (
    SELECT * 
    FROM tasks 
    WHERE business_id = p_business_id 
      AND created_at BETWEEN p_start AND p_end 
      AND is_draft = false
),
s_data AS (
    SELECT 
        assigned_to as id,
        u.name,
        COUNT(*) as assigned,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at)) / 60) FILTER (WHERE status = 'completed' AND assigned_at IS NOT NULL AND completed_at IS NOT NULL) as avg_minutes
    FROM t_data t
    JOIN users u ON u.id = t.assigned_to
    GROUP BY assigned_to, u.name
),
base_stats AS (
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'unassigned') as unassigned
    FROM t_data
)
SELECT 
    b.total,
    b.completed,
    b.in_progress,
    b.unassigned,
    CASE WHEN b.total > 0 THEN (b.completed * 100 / b.total)::integer ELSE 0 END as completion_rate,
    COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'assigned', s.assigned,
            'completed', s.completed,
            'completionRate', CASE WHEN s.assigned > 0 THEN (s.completed * 100 / s.assigned)::integer ELSE 0 END,
            'avgMinutes', ROUND(s.avg_minutes)::integer
        ))
        FROM s_data s
    ), '[]'::jsonb) as staff_stats
FROM base_stats b;
$$;
