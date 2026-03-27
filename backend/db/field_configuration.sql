INSERT INTO field_configurations
(model_name, field_name, field_label, input_type,
 reference_model, reference_key, reference_label,
 source_key, target_key, target_table,
 is_required, enterprize_fid, created_by, updated_by,
 created_timestamp, updated_timestamp)
VALUES
('user','enterprize_fid','Enterprize','select',
 'Enterprize','enterprize_id','enterprize_name',
 NULL,NULL,'users',
 false,1,1,NULL,
 '2026-02-27 14:32:02.664229+05:30','2026-02-27 14:32:02.664229+05:30'),

('user','role_fid','Role','select',
 'Role','role_id','role_name',
 'user_fid','role_fid','user_roles',
 false,1,1,NULL,
 '2026-02-27 14:32:02.664229+05:30','2026-02-27 14:32:02.664229+05:30'),

('user','user_profile_pic','Profile Picture','file',
 NULL,NULL,NULL,
 NULL,NULL,'users',
 false,1,1,NULL,
 '2026-02-27 14:32:02.664229+05:30','2026-02-27 14:32:02.664229+05:30'),

('role','enterprize_fid','Enterprize','select',
 'Enterprize','enterprize_id','enterprize_name',
 NULL,NULL,'roles',
 true,1,1,NULL,
 '2026-02-27 14:32:02.664229+05:30','2026-02-27 14:32:02.664229+05:30');
