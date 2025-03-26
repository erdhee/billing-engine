import { ApplicationErrors } from "@enums/application.errors";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ApplicationError } from "@utilities/application_error";

export class BaseService {
  private datasource?: SupabaseClient;

  getDatasource(): SupabaseClient {
    if (this.datasource) {
      return this.datasource;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new ApplicationError({
        status: 500,
        code: ApplicationErrors.INVALID_CREDENTIALS,
      });
    }

    this.datasource = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (url: any, options = {}) => {
          return fetch(url, { ...options, cache: "no-store" });
        },
      },
    });

    return this.datasource;
  }
}
