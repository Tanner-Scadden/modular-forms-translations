import {
  SubmitHandler,
  createForm,
  getError,
  getErrors,
  getValue,
  getValues,
  minLength,
  setValues,
  valiForm,
} from "@modular-forms/solid";
import { For, JSXElement, Show, createEffect, createSignal } from "solid-js";
import { Input, array, enumType, object, record, string } from "valibot";

// -------------------------- Constants -------------------
const Languages = ["en", "es"] as const;

// -------------------------- Schemas -------------------
const TranslationSchema = object({
  name: string([minLength(1, "Name is required")]),
});

const FormSchema = object({
  languages: array(enumType(Languages)),
  translations: record(string(), TranslationSchema),
});

// -------------------------- Types -------------------
type Language = (typeof Languages)[number];

type LanguageControllerChildrenProps<Label extends string = `${1}`> = {
  baseLabel: `${Label}.${Language}`;
};

type LanguageControllerProps<Label extends string = `${1}`> = {
  languages: Language[];
  baseLabel: Label;
  children: ({
    baseLabel,
  }: LanguageControllerChildrenProps<Label>) => JSXElement;
  errors: Partial<Record<Language, boolean>>;
};

type ExampleForm = Input<typeof FormSchema>;

// -------------------------- Components -------------------
const LanguageController = <Label extends string = `${1}`>(
  props: LanguageControllerProps<Label>
) => {
  const [languageInView, setLanguageInView] = createSignal<Language>(
    props.languages[0]
  );

  return (
    <div class="flex flex-col p-2 gap-2 rounded-lg bg-gray-200 border-gray-300">
      <div class="flex items-center gap-2">
        <p>Translation:</p>
        <div class="flex items-center gap-2">
          <For each={props.languages}>
            {(language) => {
              const selected = () => languageInView() === language;
              return (
                <button
                  type="button"
                  class={`capitalize p-2 ${
                    props.errors[language] && !selected()
                      ? "bg-red-300"
                      : selected()
                      ? "bg-blue-300"
                      : ""
                  }`}
                  onClick={() => {
                    setLanguageInView(language);
                  }}
                >
                  {language}
                </button>
              );
            }}
          </For>
        </div>
      </div>
      <For each={props.languages}>
        {(language) => {
          return (
            <Show
              when={language === languageInView()}
              fallback={
                <div class="w-0 overflow-hidden h-0 my-[-5px]">
                  {props.children({
                    get baseLabel() {
                      return `${
                        props.baseLabel
                      }.${languageInView()}` as `${Label}.${Language}`;
                    },
                  })}
                </div>
              }
            >
              <div class="w-full">
                {props.children({
                  get baseLabel() {
                    return `${
                      props.baseLabel
                    }.${languageInView()}` as `${Label}.${Language}`;
                  },
                })}
              </div>
            </Show>
          );
        }}
      </For>
    </div>
  );
};

export default function Home() {
  const [form, { Form, Field }] = createForm<ExampleForm>({
    validate: valiForm(FormSchema),
    initialValues: {
      languages: ["en"],
    },
  });

  const onSubmit: SubmitHandler<ExampleForm> = (values) => {
    console.log(values);
  };

  const formData = () => ({
    errors: getErrors(form),
    values: getValues(form),
  });

  createEffect(() => {
    const _formData = formData();
    console.log("errors: ", _formData.errors);
    console.log("values: ", _formData.values);
  });

  return (
    <Form
      onSubmit={onSubmit}
      id="i18nExample"
      class="flex flex-col gap-2 max-w-lg pt-3 pl-3"
    >
      <Field name="languages" type="string[]">
        {(field) => (
          <div>
            <div
              class={`p-3 flex gap-2 items-center border border-gray-300 ${
                field.error ? "border-error border" : ""
              }`}
            >
              <For each={Languages}>
                {(language) => {
                  const selected = () => field.value?.includes(language);
                  return (
                    <button
                      type="button"
                      class={`p-2 ${
                        field.error
                          ? "bg-red-300"
                          : selected()
                          ? "bg-blue-300"
                          : ""
                      }`}
                      onClick={() => {
                        const languages = field.value || [];

                        const translationKey =
                          `translations.${language}.name` as const;

                        console.log({ translationKey });
                        if (selected()) {
                          setValues(form, {
                            languages: languages.filter((l) => l !== language),
                            [translationKey]: null,
                          });

                          return;
                        }

                        setValues(form, {
                          languages: [...languages, language],
                          [translationKey]: null,
                        });
                      }}
                    >
                      {language}
                    </button>
                  );
                }}
              </For>
            </div>
          </div>
        )}
      </Field>
      <LanguageController
        baseLabel="translations"
        languages={getValue(form, "languages") || []}
        errors={{
          en: !!getError(form, "translations.en.name"),
          es: !!getError(form, "translations.es.name"),
        }}
      >
        {({ baseLabel }) => (
          <Field name={`${baseLabel}.name`} keepActive>
            {(field, props) => (
              <div class="flex flex-col gap-2">
                <label>Name</label>
                <input
                  {...props}
                  name={field.name}
                  value={field.value}
                  placeholder="Enter name"
                  required
                />
                {field.error && <p class="text-red-600">{field.error}</p>}
              </div>
            )}
          </Field>
        )}
      </LanguageController>
      <button type="submit">Submit</button>
    </Form>
  );
}
