// src/pages/AdminPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

function AdminPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("questions");

  const [form, setForm] = useState({
    question_text: "", option_a: "", option_b: "", option_c: "", option_d: "",
    correct_option: "a", explanation: "", topic: "", difficulty: "Medium", is_premium: false,
  });

  const [examForm, setExamForm] = useState({
    name: "", name_th: "", description: "", description_th: "",
    category: "English", difficulty: "Intermediate", is_premium: false,
  });

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    fetchExams();
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (selectedExam) fetchQuestions(selectedExam.id);
  }, [selectedExam]);

  async function fetchExams() {
    try {
      const { data, error } = await supabase.from("exams").select("*").order("name");
      if (error) throw error;
      setExams(data);
      if (data.length > 0) setSelectedExam(data[0]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchQuestions(examId) {
    try {
      const { data, error } = await supabase.from("questions").select("*").eq("exam_id", examId).order("created_at");
      if (error) throw error;
      setQuestions(data);
    } catch (err) { console.error(err); }
  }

  async function handleAddQuestion() {
    if (!selectedExam) return;
    if (!form.question_text || !form.explanation || !form.topic) {
      setMessage({ type: "error", text: "Please fill in all required fields." }); return;
    }
    setSaving(true); setMessage(null);
    try {
      const { error } = await supabase.from("questions").insert({ exam_id: selectedExam.id, ...form });
      if (error) throw error;
      setMessage({ type: "success", text: "Question added successfully!" });
      setForm({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a", explanation: "", topic: "", difficulty: "Medium", is_premium: false });
      fetchQuestions(selectedExam.id);
      setActiveTab("questions");
    } catch (err) { setMessage({ type: "error", text: err.message }); }
    finally { setSaving(false); }
  }

  async function handleDeleteQuestion(questionId) {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("questions").delete().eq("id", questionId);
      if (error) throw error;
      fetchQuestions(selectedExam.id);
    } catch (err) { setMessage({ type: "error", text: err.message }); }
  }

  async function handleAddExam() {
    if (!examForm.name || !examForm.description || !examForm.category) {
      setMessage({ type: "error", text: "Please fill in all required fields." }); return;
    }
    setSaving(true); setMessage(null);
    try {
      const { error } = await supabase.from("exams").insert(examForm);
      if (error) throw error;
      setMessage({ type: "success", text: `${examForm.name} exam added!` });
      setExamForm({ name: "", name_th: "", description: "", description_th: "", category: "English", difficulty: "Intermediate", is_premium: false });
      fetchExams(); setActiveTab("questions");
    } catch (err) { setMessage({ type: "error", text: err.message }); }
    finally { setSaving(false); }
  }

  const updateForm = (f, v) => setForm((p) => ({ ...p, [f]: v }));
  const updateExamForm = (f, v) => setExamForm((p) => ({ ...p, [f]: v }));

  if (loading) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <p className="font-body text-text-secondary">Loading admin panel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[1100px] mx-auto px-6 py-10 pb-24 flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="font-heading text-[40px] text-text-primary tracking-wide leading-none">Admin Panel</h1>
          <p className="font-body text-[14px] text-text-secondary mt-1">Manage exams and questions</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 py-3 rounded-xl text-[14px] font-body border ${
            message.type === "success"
              ? "bg-success-bg border-success/30 text-success"
              : "bg-danger-bg border-danger/30 text-danger"
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">

          {/* Sidebar */}
          <div className="bg-elevated border border-border rounded-2xl p-4 flex flex-col gap-1.5 self-start">
            <p className="font-body font-bold text-[11px] text-text-tertiary uppercase tracking-widest px-2 mb-1">Exams</p>
            {exams.map((exam) => (
              <button key={exam.id}
                onClick={() => { setSelectedExam(exam); setActiveTab("questions"); setMessage(null); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl border-none cursor-pointer flex flex-col gap-0.5 transition-colors ${
                  selectedExam?.id === exam.id
                    ? "bg-teal/10 text-teal font-bold"
                    : "bg-transparent text-text-primary hover:bg-card"
                } font-body text-[14px]`}>
                <span>{exam.name}</span>
                <span className="text-[11px] text-text-tertiary font-normal">{exam.category}</span>
              </button>
            ))}
            <button onClick={() => { setActiveTab("addExam"); setMessage(null); }}
              className="mt-2 bg-transparent border border-dashed border-border text-text-tertiary px-3 py-2.5 rounded-xl font-body text-[13px] cursor-pointer hover:border-border-strong transition-colors text-left">
              + Add New Exam
            </button>
          </div>

          {/* Main */}
          <div className="flex flex-col gap-4">

            {/* Tabs */}
            {activeTab !== "addExam" && (
              <div className="flex gap-2">
                {[["questions", `Questions (${questions.length})`], ["addQuestion", "+ Add Question"]].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-full font-body font-medium text-[13px] cursor-pointer border transition-all ${
                      activeTab === tab
                        ? "bg-teal text-base border-teal font-semibold"
                        : "bg-transparent text-text-secondary border-border hover:border-border-strong"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Questions list */}
            {activeTab === "questions" && (
              <div className="flex flex-col gap-3">
                {questions.length === 0 ? (
                  <div className="bg-elevated border border-border rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
                    <p className="font-body text-[15px] text-text-secondary">No questions yet for {selectedExam?.name}.</p>
                    <button onClick={() => setActiveTab("addQuestion")}
                      className="px-6 py-3 bg-teal text-base rounded-xl font-body font-semibold text-[14px] border-none cursor-pointer">
                      Add First Question
                    </button>
                  </div>
                ) : questions.map((q, i) => (
                  <div key={q.id} className="bg-elevated border border-border rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-heading text-[18px] text-teal min-w-[32px]">Q{i + 1}</span>
                      <div className="flex gap-1.5 flex-grow flex-wrap">
                        <span className="bg-card border border-border text-text-secondary text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-body">{q.topic}</span>
                        <span className="bg-card border border-border text-text-secondary text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-body">{q.difficulty}</span>
                        {q.is_premium && <span className="bg-warning-bg border border-warning/20 text-warning text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-body">Premium</span>}
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id)}
                        className="bg-transparent border border-danger/40 text-danger px-3 py-1 rounded-lg text-[12px] font-body cursor-pointer hover:bg-danger-bg transition-colors">
                        Delete
                      </button>
                    </div>
                    <p className="font-body font-semibold text-[15px] text-text-primary leading-relaxed">{q.question_text}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {["a", "b", "c", "d"].map((key) => (
                        <p key={key} className={`font-body text-[13px] leading-relaxed ${key === q.correct_option ? "text-success font-bold" : "text-text-secondary"}`}>
                          {key.toUpperCase()}. {q[`option_${key}`]}{key === q.correct_option && " ✓"}
                        </p>
                      ))}
                    </div>
                    <p className="font-body text-[13px] text-text-tertiary leading-relaxed pt-3 border-t border-border">💡 {q.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add question form */}
            {activeTab === "addQuestion" && (
              <div className="bg-elevated border border-border rounded-2xl p-7 flex flex-col gap-4">
                <h2 className="font-body font-bold text-[18px] text-text-primary">Add Question to {selectedExam?.name}</h2>

                <FormField label="Question *">
                  <textarea rows={3} placeholder="Enter the question text..."
                    value={form.question_text} onChange={(e) => updateForm("question_text", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors resize-y" />
                </FormField>

                {["a", "b", "c", "d"].map((key) => (
                  <FormField key={key} label={`Option ${key.toUpperCase()} *`}>
                    <input placeholder={`Option ${key.toUpperCase()}`} value={form[`option_${key}`]}
                      onChange={(e) => updateForm(`option_${key}`, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors" />
                  </FormField>
                ))}

                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: "Correct Answer *", field: "correct_option", options: ["a","b","c","d"].map(k => ({ value: k, label: k.toUpperCase() })) },
                    { label: "Difficulty *", field: "difficulty", options: ["Easy","Medium","Hard"].map(d => ({ value: d, label: d })) },
                  ].map(({ label, field, options }) => (
                    <div key={field} className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                      <label className="font-body font-semibold text-[13px] text-text-secondary">{label}</label>
                      <select value={form[field]} onChange={(e) => updateForm(field, e.target.value)}
                        className="px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors">
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                    <label className="font-body font-semibold text-[13px] text-text-secondary">Topic *</label>
                    <input placeholder="e.g. Grammar" value={form.topic} onChange={(e) => updateForm("topic", e.target.value)}
                      className="px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors" />
                  </div>
                </div>

                <FormField label="Explanation *">
                  <textarea rows={3} placeholder="Explain why the correct answer is right..."
                    value={form.explanation} onChange={(e) => updateForm("explanation", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors resize-y" />
                </FormField>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={form.is_premium} onChange={(e) => updateForm("is_premium", e.target.checked)} className="w-4 h-4" />
                  <span className="font-body text-[14px] text-text-secondary">Premium question (requires subscription)</span>
                </label>

                <div className="flex gap-3 justify-end mt-2">
                  <button onClick={() => setActiveTab("questions")}
                    className="px-6 py-3 bg-transparent border border-border text-text-secondary rounded-xl font-body font-semibold text-[14px] cursor-pointer hover:border-border-strong transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddQuestion} disabled={saving}
                    className={`px-6 py-3 bg-teal text-base border-none rounded-xl font-body font-semibold text-[14px] cursor-pointer transition-opacity ${saving ? "opacity-60" : "opacity-100"}`}>
                    {saving ? "Saving..." : "Save Question"}
                  </button>
                </div>
              </div>
            )}

            {/* Add exam form */}
            {activeTab === "addExam" && (
              <div className="bg-elevated border border-border rounded-2xl p-7 flex flex-col gap-4">
                <h2 className="font-body font-bold text-[18px] text-text-primary">Add New Exam</h2>

                <div className="flex gap-4 flex-wrap">
                  <FormField label="Exam Name * (e.g. IELTS)" className="flex-1 min-w-[140px]">
                    <input placeholder="e.g. IELTS" value={examForm.name} onChange={(e) => updateExamForm("name", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors" />
                  </FormField>
                  <FormField label="Thai Name" className="flex-1 min-w-[140px]">
                    <input placeholder="e.g. ไอเอลทีเอส" value={examForm.name_th} onChange={(e) => updateExamForm("name_th", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors" />
                  </FormField>
                </div>

                <FormField label="Description * (English)">
                  <textarea rows={2} placeholder="Brief description..." value={examForm.description} onChange={(e) => updateExamForm("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors resize-y" />
                </FormField>

                <FormField label="Description (Thai)">
                  <textarea rows={2} placeholder="คำอธิบายภาษาไทย..." value={examForm.description_th} onChange={(e) => updateExamForm("description_th", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors resize-y" />
                </FormField>

                <div className="flex gap-4 flex-wrap">
                  {[
                    { label: "Category *", field: "category", options: ["English","Thai National","Math","Science","Other"] },
                    { label: "Difficulty *", field: "difficulty", options: ["Beginner","Intermediate","Advanced"] },
                  ].map(({ label, field, options }) => (
                    <div key={field} className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                      <label className="font-body font-semibold text-[13px] text-text-secondary">{label}</label>
                      <select value={examForm[field]} onChange={(e) => updateExamForm(field, e.target.value)}
                        className="px-4 py-3 rounded-xl border border-border bg-card text-text-primary text-[14px] font-body outline-none focus:border-teal transition-colors">
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={examForm.is_premium} onChange={(e) => updateExamForm("is_premium", e.target.checked)} className="w-4 h-4" />
                  <span className="font-body text-[14px] text-text-secondary">Premium exam (requires subscription)</span>
                </label>

                <div className="flex gap-3 justify-end mt-2">
                  <button onClick={() => setActiveTab("questions")}
                    className="px-6 py-3 bg-transparent border border-border text-text-secondary rounded-xl font-body font-semibold text-[14px] cursor-pointer hover:border-border-strong transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddExam} disabled={saving}
                    className={`px-6 py-3 bg-teal text-base border-none rounded-xl font-body font-semibold text-[14px] cursor-pointer transition-opacity ${saving ? "opacity-60" : "opacity-100"}`}>
                    {saving ? "Saving..." : "Save Exam"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="font-body font-semibold text-[13px] text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

export default AdminPage;
