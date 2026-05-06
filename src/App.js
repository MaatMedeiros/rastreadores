import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { PlusCircle, Pencil, Trash2, X, Check, Radio } from 'lucide-react'

const emptyForm = { nome: '', placa: '', responsavel: '' }

export default function App() {
  const [rastreadores, setRastreadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [salvando, setSalvando] = useState(false)
  const [deletando, setDeletando] = useState(null)

  useEffect(() => {
    buscarRastreadores()
  }, [])

  async function buscarRastreadores() {
    setLoading(true)
    const { data, error } = await supabase
      .from('rastreadores')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setRastreadores(data)
    setLoading(false)
  }

  function abrirModalNovo() {
    setEditando(null)
    setForm(emptyForm)
    setModalAberto(true)
  }

  function abrirModalEditar(rastreador) {
    setEditando(rastreador.id)
    setForm({ nome: rastreador.nome, placa: rastreador.placa, responsavel: rastreador.responsavel })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setEditando(null)
    setForm(emptyForm)
  }

  async function salvar() {
    if (!form.nome || !form.placa || !form.responsavel) return
    setSalvando(true)
    if (editando) {
      const { error } = await supabase.from('rastreadores').update(form).eq('id', editando)
      if (!error) setRastreadores(prev => prev.map(r => r.id === editando ? { ...r, ...form } : r))
    } else {
      const { data, error } = await supabase.from('rastreadores').insert([form]).select()
      if (!error) setRastreadores(prev => [...prev, data[0]])
    }
    setSalvando(false)
    fecharModal()
  }

  async function deletar(id) {
    setDeletando(id)
    const { error } = await supabase.from('rastreadores').delete().eq('id', id)
    if (!error) setRastreadores(prev => prev.filter(r => r.id !== id))
    setDeletando(null)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Radio size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-none">Rastreadores</h1>
            <p className="text-xs text-slate-400 mt-0.5">{rastreadores.length} dispositivo{rastreadores.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={abrirModalNovo}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <PlusCircle size={18} />
          Novo
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Carregando...</p>
          </div>
        ) : rastreadores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="bg-slate-800 p-5 rounded-full">
              <Radio size={36} className="text-slate-500" />
            </div>
            <div>
              <p className="text-slate-300 font-semibold">Nenhum rastreador ainda</p>
              <p className="text-slate-500 text-sm mt-1">Toque em "Novo" para adicionar o primeiro</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-1">
            {rastreadores.map(r => (
              <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-blue-500/20 p-2.5 rounded-xl shrink-0">
                    <Radio size={20} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white text-base leading-tight truncate">{r.nome}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="bg-slate-700 text-slate-300 text-xs font-mono font-semibold px-2 py-0.5 rounded-lg tracking-wider">
                        {r.placa.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-sm truncate">{r.responsavel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => abrirModalEditar(r)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-xl transition-colors">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => deletar(r.id)} disabled={deletando === r.id} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-colors">
                    {deletando === r.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-base font-bold">{editando ? 'Editar Rastreador' : 'Novo Rastreador'}</h2>
              <button onClick={fecharModal} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {['nome', 'placa', 'responsavel'].map((campo) => (
                <div key={campo}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    {campo === 'nome' ? 'Nome do Rastreador' : campo === 'placa' ? 'Placa do Veículo' : 'Responsável'}
                  </label>
                  <input
                    type="text"
                    value={form[campo]}
                    onChange={e => setForm({ ...form, [campo]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 focus:border-blue-500 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-5 pt-0">
              <button onClick={fecharModal} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando || !form.nome || !form.placa || !form.responsavel} className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {salvando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} />Salvar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}