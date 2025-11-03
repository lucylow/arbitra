import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface DisputeFormData {
  title: string;
  description: string;
  disputeType: 'contract' | 'payment' | 'service' | 'property' | 'other';
  amount: number;
  currency: string;
  governingLaw: string;
  defendantPrincipal: string;
  arbitrationClause: string;
  evidence: File[];
}

interface StepProps {
  data: Partial<DisputeFormData>;
  updateData: (data: Partial<DisputeFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const Step1: React.FC<StepProps> = ({ data, updateData, nextStep }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data
  });

  const onSubmit = (formData: Partial<DisputeFormData>) => {
    updateData(formData);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Dispute Overview</h3>
        <p className="text-sm text-gray-500">Describe the nature of your dispute</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Dispute Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title', { required: 'Dispute title is required' })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Late delivery of website development services"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Detailed Description *
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Provide a detailed explanation of the dispute, including key dates, agreements, and issues..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="disputeType" className="block text-sm font-medium text-gray-700">
              Dispute Type *
            </label>
            <select
              id="disputeType"
              {...register('disputeType', { required: 'Type is required' })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="contract">Contract Breach</option>
              <option value="payment">Payment Dispute</option>
              <option value="service">Service Quality</option>
              <option value="property">Property Damage</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount in Dispute
            </label>
            <div className="mt-1 flex rounded-lg shadow-sm">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                $
              </span>
              <input
                type="number"
                id="amount"
                {...register('amount', { min: 0 })}
                className="block w-full rounded-r-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

const Step2: React.FC<StepProps> = ({ data, updateData, nextStep, prevStep }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data
  });

  const onSubmit = (formData: Partial<DisputeFormData>) => {
    updateData(formData);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Legal Framework</h3>
        <p className="text-sm text-gray-500">Define the legal parameters for arbitration</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="defendantPrincipal" className="block text-sm font-medium text-gray-700">
            Defendant's Internet Identity *
          </label>
          <input
            type="text"
            id="defendantPrincipal"
            {...register('defendantPrincipal', { 
              required: "Defendant's identity is required",
              pattern: {
                value: /^[a-z0-9-]+$/,
                message: "Please enter a valid Internet Identity principal"
              }
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-sm"
            placeholder="e.g., k2t6j-2nvnp-..."
          />
          {errors.defendantPrincipal && (
            <p className="mt-1 text-sm text-red-600">{errors.defendantPrincipal.message as string}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="governingLaw" className="block text-sm font-medium text-gray-700">
              Governing Law *
            </label>
            <select
              id="governingLaw"
              {...register('governingLaw', { required: 'Governing law is required' })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select jurisdiction</option>
              <option value="US-NY">New York, USA</option>
              <option value="US-CA">California, USA</option>
              <option value="UK">United Kingdom</option>
              <option value="EU">European Union</option>
              <option value="SG">Singapore</option>
              <option value="HK">Hong Kong</option>
              <option value="custom">Custom Agreement</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              id="currency"
              {...register('currency')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="ckBTC">ckBTC</option>
              <option value="ICP">ICP</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="arbitrationClause" className="block text-sm font-medium text-gray-700">
            Arbitration Clause
          </label>
          <textarea
            id="arbitrationClause"
            rows={3}
            {...register('arbitrationClause')}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Any specific arbitration terms or conditions..."
          />
          <p className="mt-1 text-sm text-gray-500">
            If left blank, standard Arbitra arbitration rules will apply
          </p>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

const Step3: React.FC<StepProps> = ({ data, updateData, prevStep }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setFiles(prev => [...prev, file]);
  };

  const handleSubmit = async () => {
    updateData({ evidence: files });
    // Submit to blockchain
    console.log('Submitting dispute:', { ...data, evidence: files });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Evidence Submission</h3>
        <p className="text-sm text-gray-500">
          Upload supporting documents and evidence. All files will be securely stored on blockchain.
        </p>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              Array.from(e.target.files).forEach(handleFileUpload);
            }
          }}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, images up to 10MB each. All files are encrypted and stored on Constellation network.
            </p>
          </div>
        </label>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {file.type.startsWith('image/') ? (
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadProgress[file.name] === 100 ? (
                  <div className="flex items-center text-green-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs">Secured</span>
                  </div>
                ) : (
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name] || 0}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blockchain Security Badge */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm font-medium text-blue-900">Blockchain Secured</span>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          All evidence is cryptographically hashed and stored on Constellation Network with tamper-proof chain of custody.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Submit Dispute
        </button>
      </div>
    </div>
  );
};

export const DisputeCreationWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DisputeFormData>>({});

  const updateFormData = (data: Partial<DisputeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const steps = [
    { number: 1, title: 'Overview', component: Step1 },
    { number: 2, title: 'Legal Framework', component: Step2 },
    { number: 3, title: 'Evidence', component: Step3 },
  ];

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            {steps.map(step => (
              <span key={step.number}>{step.title}</span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {CurrentStepComponent && (
            <CurrentStepComponent
              data={formData}
              updateData={updateFormData}
              nextStep={() => setCurrentStep(prev => Math.min(prev + 1, steps.length))}
              prevStep={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
            />
          )}
        </div>
      </div>
    </div>
  );
};

